// src/types/errors.ts
// Error handling types and utilities

import type { ApiError } from './api';

// ============================================================================
// FORM ERROR TYPES
// ============================================================================

export type FormErrors<T> = {
  [K in keyof T]?: string | string[];
};

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

// ============================================================================
// VALIDATION ERROR TYPES
// ============================================================================

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

// ============================================================================
// ERROR SEVERITY LEVELS
// ============================================================================

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// ============================================================================
// APPLICATION ERROR CLASS
// ============================================================================

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

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert to API error format
   */
  toApiError(): ApiError {
    return {
      error: this.code,
      message: this.message,
      details: this.context,
    };
  }

  /**
   * Create AppError from API error
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

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Check if error is an API error
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
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extract error message from various error types
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
 * Extract error code from various error types
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

// ============================================================================
// FORM VALIDATION UTILITIES
// ============================================================================

/**
 * Convert API validation errors to form errors
 */
export function apiErrorsToFormErrors<T>(errors: FieldError[]): FormErrors<T> {
  const formErrors: FormErrors<T> = {};

  errors.forEach((error) => {
    const fieldName = error.field as keyof T;
    if (formErrors[fieldName]) {
      // Handle multiple errors for the same field
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
 * Get first error message for a field
 */
export function getFirstFieldError<T>(errors: FormErrors<T>, field: keyof T): string | undefined {
  const error = errors[field];
  if (Array.isArray(error)) {
    return error[0];
  }
  return error;
}

/**
 * Check if form has any errors
 */
export function hasFormErrors<T>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Clear specific field errors
 */
export function clearFieldError<T>(errors: FormErrors<T>, field: keyof T): FormErrors<T> {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}

// ============================================================================
// ERROR LOGGING UTILITIES
// ============================================================================

/**
 * Log error with context (development only)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Log');
    console.error('Error:', error);
    if (context) {
      console.table(context);
    }
    console.groupEnd();
  }
}

/**
 * Create error context object
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
