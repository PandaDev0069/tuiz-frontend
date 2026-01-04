// ====================================================
// File Name   : apiClient.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-12-26

// Description:
// - HTTP client with authentication and error handling for TUIZ backend
// - Provides typed HTTP methods (GET, POST, PUT, PATCH, DELETE)
// - Handles authentication token injection and token expiration
// - Includes error handling utilities with user-friendly messages

// Notes:
// - Uses singleton pattern for service instance
// - Automatically injects authentication tokens from auth store
// - Provides Japanese error messages for user-facing errors
// - Error logging only occurs in development mode
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { cfg } from '@/config/config';
import { useAuthStore } from '@/state/useAuthStore';
import type { ApiError, ErrorHandlingConfig, ErrorCode } from '@/types/api';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const AUTH_BEARER_PREFIX = 'Bearer ';
const HEADER_CONTENT_TYPE = 'application/json';
const ERROR_CODE_NETWORK = 'network_error';
const ERROR_CODE_SERVER_ERROR = 'server_error';
const ERROR_MESSAGE_UNKNOWN = '不明なエラーが発生しました。';
const ERROR_MESSAGE_NETWORK =
  'ネットワークエラーが発生しました。インターネット接続を確認してください。';

const HTTP_METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'] as const;

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const ERROR_CODES_BY_STATUS: Record<number, ErrorCode> = {
  [HTTP_STATUS.BAD_REQUEST]: 'invalid_payload',
  [HTTP_STATUS.UNAUTHORIZED]: 'unauthorized',
  [HTTP_STATUS.FORBIDDEN]: 'forbidden',
  [HTTP_STATUS.NOT_FOUND]: 'not_found',
  [HTTP_STATUS.CONFLICT]: 'duplicate_entry',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'validation_failed',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'rate_limit_exceeded',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: ERROR_CODE_SERVER_ERROR,
} as const;

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  invalid_payload: 'フォームの内容に問題があります。入力を確認してください。',
  invalid_credentials: '認証に失敗しました。再度ログインしてください。',
  unauthorized: '認証が必要です。ログインしてください。',
  forbidden: 'この操作を実行する権限がありません。',
  not_found: '要求されたリソースが見つかりません。',
  validation_failed: '入力内容に問題があります。必要な項目を確認してください。',
  duplicate_entry: 'この項目は既に存在します。',
  rate_limit_exceeded: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
  server_error: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
  network_error: ERROR_MESSAGE_NETWORK,
  timeout_error: 'リクエストがタイムアウトしました。再試行してください。',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
// Types are imported from @/types/api

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: ApiClient
 * Description:
 * - HTTP client for TUIZ backend API
 * - Handles authentication, request formatting, and error parsing
 * - Provides typed HTTP methods with automatic token injection
 */
export class ApiClient {
  private baseUrl: string;

  /**
   * Constructor: ApiClient
   * Description:
   * - Initializes the client with API base URL from configuration
   */
  constructor() {
    this.baseUrl = cfg.apiBase;
  }

  /**
   * Method: get
   * Description:
   * - Performs GET request to specified endpoint
   *
   * Parameters:
   * - endpoint (string): API endpoint path
   * - options (RequestInit, optional): Additional fetch options
   *
   * Returns:
   * - Promise<T>: Typed response data
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Method: post
   * Description:
   * - Performs POST request to specified endpoint with data
   *
   * Parameters:
   * - endpoint (string): API endpoint path
   * - data (unknown): Request body data
   * - options (RequestInit, optional): Additional fetch options
   *
   * Returns:
   * - Promise<T>: Typed response data
   */
  async post<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Method: put
   * Description:
   * - Performs PUT request to specified endpoint with data
   *
   * Parameters:
   * - endpoint (string): API endpoint path
   * - data (unknown): Request body data
   * - options (RequestInit, optional): Additional fetch options
   *
   * Returns:
   * - Promise<T>: Typed response data
   */
  async put<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Method: patch
   * Description:
   * - Performs PATCH request to specified endpoint with data
   *
   * Parameters:
   * - endpoint (string): API endpoint path
   * - data (unknown): Request body data
   * - options (RequestInit, optional): Additional fetch options
   *
   * Returns:
   * - Promise<T>: Typed response data
   */
  async patch<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Method: delete
   * Description:
   * - Performs DELETE request to specified endpoint
   *
   * Parameters:
   * - endpoint (string): API endpoint path
   * - options (RequestInit, optional): Additional fetch options
   *
   * Returns:
   * - Promise<T>: Typed response data
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Method: isAuthenticated
   * Description:
   * - Checks if user is currently authenticated
   *
   * Returns:
   * - boolean: True if authentication token exists, false otherwise
   */
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  /**
   * Method: getBaseUrl
   * Description:
   * - Gets the base URL for API requests
   *
   * Returns:
   * - string: Base URL string
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Method: createQueryString
   * Description:
   * - Creates URL query string from parameter object
   * - Filters out undefined, null, and empty string values
   *
   * Parameters:
   * - params (Record<string, unknown>): Parameters to convert to query string
   *
   * Returns:
   * - string: Query string with leading '?' or empty string
   */
  createQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  //----------------------------------------------------
  // 5. Helper Functions
  //----------------------------------------------------
  /**
   * Method: getAuthToken
   * Description:
   * - Retrieves authentication token from auth store
   *
   * Returns:
   * - string | null: Authentication token or null if not available
   */
  private getAuthToken(): string | null {
    const { session } = useAuthStore.getState();
    return session?.access_token || null;
  }

  /**
   * Method: createHeaders
   * Description:
   * - Creates request headers with authentication token
   *
   * Parameters:
   * - customHeaders (Record<string, string>, optional): Additional headers to include
   *
   * Returns:
   * - HeadersInit: Headers object with Content-Type and Authorization
   */
  private createHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': HEADER_CONTENT_TYPE,
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `${AUTH_BEARER_PREFIX}${token}`;
    }

    return headers;
  }

  /**
   * Method: handleResponse
   * Description:
   * - Handles HTTP response and parses JSON or text
   * - Throws error if response is not OK
   *
   * Parameters:
   * - response (Response): Fetch response object
   *
   * Returns:
   * - Promise<T>: Parsed response data
   *
   * Throws:
   * - ApiError: When response is not OK
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await this.parseError(response);
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes(HEADER_CONTENT_TYPE)) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  /**
   * Method: parseError
   * Description:
   * - Parses error from HTTP response
   * - Falls back to generic error if JSON parsing fails
   *
   * Parameters:
   * - response (Response): Fetch response object
   *
   * Returns:
   * - Promise<ApiError>: Parsed error object
   */
  private async parseError(response: Response): Promise<ApiError> {
    let errorData: Partial<ApiError>;

    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: this.getErrorCodeFromStatus(response.status),
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      error: errorData.error || this.getErrorCodeFromStatus(response.status),
      message: errorData.message || response.statusText,
      requestId: errorData.requestId,
      details: errorData.details,
    };
  }

  /**
   * Method: getErrorCodeFromStatus
   * Description:
   * - Maps HTTP status codes to error codes
   *
   * Parameters:
   * - status (number): HTTP status code
   *
   * Returns:
   * - ErrorCode: Corresponding error code
   */
  private getErrorCodeFromStatus(status: number): ErrorCode {
    return ERROR_CODES_BY_STATUS[status] || ERROR_CODE_SERVER_ERROR;
  }

  /**
   * Method: request
   * Description:
   * - Generic HTTP request method with error handling
   * - Handles authentication, request formatting, and network errors
   *
   * Parameters:
   * - method (string): HTTP method
   * - endpoint (string): API endpoint path
   * - data (unknown, optional): Request body data
   * - options (RequestInit, optional): Additional fetch options
   *
   * Returns:
   * - Promise<T>: Typed response data
   *
   * Throws:
   * - ApiError: When request fails or response is not OK
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: this.createHeaders(options?.headers as Record<string, string>),
      ...options,
    };

    if (
      data &&
      HTTP_METHODS_WITH_BODY.includes(method as (typeof HTTP_METHODS_WITH_BODY)[number])
    ) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          error: ERROR_CODE_NETWORK,
          message: ERROR_MESSAGE_NETWORK,
        } as ApiError;
      }
      throw error;
    }
  }
}

/**
 * Function: getErrorMessage
 * Description:
 * - Gets user-friendly error message for API error
 * - Falls back to error message or unknown error message
 *
 * Parameters:
 * - error (ApiError): API error object
 *
 * Returns:
 * - string: User-friendly error message
 */
export function getErrorMessage(error: ApiError): string {
  return ERROR_MESSAGES[error.error as ErrorCode] || error.message || ERROR_MESSAGE_UNKNOWN;
}

/**
 * Function: handleApiError
 * Description:
 * - Handles API errors with optional configuration
 * - Normalizes errors to ApiError format
 * - Shows toast notification and logs error in development
 *
 * Parameters:
 * - error (ApiError | Error | unknown): Error to handle
 * - config (ErrorHandlingConfig, optional): Error handling configuration
 *
 * Returns:
 * - string: Error message that was displayed
 */
export function handleApiError(
  error: ApiError | Error | unknown,
  config: ErrorHandlingConfig = {},
): string {
  let apiError: ApiError;

  if (error && typeof error === 'object') {
    if ('error' in error && 'message' in error) {
      apiError = error as ApiError;
    } else if (error instanceof Error) {
      apiError = {
        error: ERROR_CODE_SERVER_ERROR,
        message: error.message || ERROR_MESSAGE_UNKNOWN,
      };
    } else {
      apiError = {
        error: ERROR_CODE_SERVER_ERROR,
        message: ERROR_MESSAGE_UNKNOWN,
      };
    }
  } else {
    apiError = {
      error: ERROR_CODE_SERVER_ERROR,
      message: String(error || ERROR_MESSAGE_UNKNOWN),
    };
  }

  const message = config.customMessage || getErrorMessage(apiError);

  if (config.showToast !== false) {
    import('react-hot-toast').then(({ toast }) => {
      toast.error(message);
    });
  }

  if (cfg.isDev && config.logToConsole !== false) {
    console.error('API Error:', {
      error: apiError.error,
      message: apiError.message,
      requestId: apiError.requestId,
      details: apiError.details,
      originalError: error,
    });
  }

  return message;
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const apiClient = new ApiClient();
