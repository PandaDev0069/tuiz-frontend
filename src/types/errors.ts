// ====================================================
// File Name   : errors.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-09-11
//
// Description:
// - Error handling types and utilities
// - Defines error types, validation utilities, and error handling helpers
// - Provides type-safe error management for the application
//
// Notes:
// - AppError class extends Error with additional context
// - Utility functions support form validation and error logging
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import type { ApiError } from './api';

//----------------------------------------------------
// 2. Types / Interfaces
//----------------------------------------------------
export type FormErrors<T> = {
  [K in keyof T]?: string | string[];
};

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: AppError
 * Description:
 * - Custom error class with additional context and severity
 * - Extends native Error with code, severity, and context
 * - Provides conversion methods to/from API error format
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Function: toApiError
   * Description:
   * - Converts AppError to API error format
   *
   * Returns:
   * - ApiError: API-compatible error object
   */
  toApiError(): ApiError {
    return {
      error: this.code,
      message: this.message,
      details: this.context,
    };
  }

  /**
   * Function: fromApiError
   * Description:
   * - Creates AppError instance from API error
   *
   * Parameters:
   * - apiError (ApiError): API error object
   *
   * Returns:
   * - AppError: AppError instance
   */
  static fromApiError(apiError: ApiError): AppError {
    return new AppError(
      apiError.message || 'Unknown API error',
      apiError.error,
      ErrorSeverity.ERROR,
      apiError.details,
    );
  }
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: isApiError
 * Description:
 * - Type guard to check if error is an API error
 *
 * Parameters:
 * - error (unknown): Error to check
 *
 * Returns:
 * - boolean: True if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiError).error === 'string'
  );
}

/**
 * Function: isAppError
 * Description:
 * - Type guard to check if error is an AppError
 *
 * Parameters:
 * - error (unknown): Error to check
 *
 * Returns:
 * - boolean: True if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Function: getErrorMessage
 * Description:
 * - Extracts error message from various error types
 *
 * Parameters:
 * - error (unknown): Error to extract message from
 *
 * Returns:
 * - string: Error message
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (isApiError(error)) {
    return error.message || error.error;
  }

  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Function: getErrorCode
 * Description:
 * - Extracts error code from various error types
 *
 * Parameters:
 * - error (unknown): Error to extract code from
 *
 * Returns:
 * - string: Error code
 */
export function getErrorCode(error: unknown): string {
  if (isApiError(error)) {
    return error.error;
  }

  if (isAppError(error)) {
    return error.code;
  }

  if (error instanceof Error) {
    return error.name;
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Function: apiErrorsToFormErrors
 * Description:
 * - Converts API validation errors to form errors format
 *
 * Parameters:
 * - errors (FieldError[]): Array of field errors
 *
 * Returns:
 * - FormErrors<T>: Form errors object
 */
export function apiErrorsToFormErrors<T>(errors: FieldError[]): FormErrors<T> {
  const formErrors: FormErrors<T> = {};

  errors.forEach((error) => {
    const fieldName = error.field as keyof T;
    if (formErrors[fieldName]) {
      const existing = formErrors[fieldName];
      if (Array.isArray(existing)) {
        existing.push(error.message);
      } else {
        formErrors[fieldName] = [existing as string, error.message];
      }
    } else {
      formErrors[fieldName] = error.message;
    }
  });

  return formErrors;
}

/**
 * Function: getFirstFieldError
 * Description:
 * - Gets first error message for a specific field
 *
 * Parameters:
 * - errors (FormErrors<T>): Form errors object
 * - field (keyof T): Field name
 *
 * Returns:
 * - string | undefined: First error message or undefined
 */
export function getFirstFieldError<T>(errors: FormErrors<T>, field: keyof T): string | undefined {
  const error = errors[field];
  if (Array.isArray(error)) {
    return error[0];
  }
  return error;
}

/**
 * Function: hasFormErrors
 * Description:
 * - Checks if form has any errors
 *
 * Parameters:
 * - errors (FormErrors<T>): Form errors object
 *
 * Returns:
 * - boolean: True if form has errors
 */
export function hasFormErrors<T>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Function: clearFieldError
 * Description:
 * - Clears error for a specific field
 *
 * Parameters:
 * - errors (FormErrors<T>): Form errors object
 * - field (keyof T): Field name to clear
 *
 * Returns:
 * - FormErrors<T>: New form errors object without specified field
 */
export function clearFieldError<T>(errors: FormErrors<T>, field: keyof T): FormErrors<T> {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}

/**
 * Function: logError
 * Description:
 * - Logs error with context in development mode
 *
 * Parameters:
 * - error (unknown): Error to log
 * - context (Record<string, unknown>, optional): Additional context
 *
 * Returns:
 * - void
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('Error Log');
    console.error('Error:', error);
    if (context) {
      console.table(context);
    }
    console.groupEnd();
  }
}

/**
 * Function: createErrorContext
 * Description:
 * - Creates error context object with component and action information
 *
 * Parameters:
 * - component (string): Component name where error occurred
 * - action (string): Action that caused the error
 * - additionalData (Record<string, unknown>, optional): Additional context data
 *
 * Returns:
 * - Record<string, unknown>: Error context object
 */
export function createErrorContext(
  component: string,
  action: string,
  additionalData?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    component,
    action,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    ...additionalData,
  };
}
