/**
 * Core API client for Validra frontend application.
 * Centralizes base URL configuration, request formatting, and error normalization.
 */

// Retrieve base URL from environment; fallback to default FastAPI dev server port
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8000";

/**
 * Standard categorized authentication error codes.
 */
export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "VALIDATION_ERROR"
  | "EMAIL_ALREADY_REGISTERED"
  | "INVALID_OR_EXPIRED_TOKEN"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Normalized API error class containing HTTP status, classified code, and optional details.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: AuthErrorCode;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code: AuthErrorCode = "UNKNOWN_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Map raw HTTP response and status into structured AuthErrorCode and clean user message.
 */
function parseApiError(status: number, data: unknown): ApiError {
  let message = "An unexpected error occurred. Please try again.";
  let code: AuthErrorCode = "UNKNOWN_ERROR";
  let details: unknown = undefined;

  if (typeof data === "object" && data !== null) {
    const errorObj = data as Record<string, unknown>;
    details = errorObj.detail || errorObj.message || errorObj.error;

    if (typeof errorObj.detail === "string") {
      message = errorObj.detail;
    } else if (typeof errorObj.message === "string") {
      message = errorObj.message;
    }
  }

  if (status === 400) {
    const lower = message.toLowerCase();
    if (lower.includes("token") || lower.includes("expired") || lower.includes("invalid link")) {
      code = "INVALID_OR_EXPIRED_TOKEN";
      message = "This verification or reset link is invalid or has expired.";
    } else {
      code = "VALIDATION_ERROR";
    }
  } else if (status === 401) {
    code = "INVALID_CREDENTIALS";
    message = "Invalid email address or password.";
  } else if (status === 403) {
    code = "FORBIDDEN";
    message = "You do not have permission to access this resource.";
  } else if (status === 409) {
    code = "EMAIL_ALREADY_REGISTERED";
    message = "An account with this email address already exists.";
  } else if (status === 422) {
    code = "VALIDATION_ERROR";
    message = "Please check your input and try again.";
  } else if (status === 429) {
    code = "RATE_LIMITED";
    message = "Too many requests. Please wait a moment before trying again.";
  } else if (status >= 500) {
    code = "SERVER_ERROR";
    message = "The server encountered an error. Please try again later.";
  }

  return new ApiError(message, status, code, details);
}

/**
 * Convert any unknown error into a friendly, human-readable string.
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return "Unable to connect to server. Please check your network connection.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

// In-memory token storage (preserves security without uncoordinated localStorage usage)
let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
}

/**
 * Generic JSON request runner.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, token, headers = {}, credentials, ...customConfig } = options;

  // Ensure leading slash for endpoint
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  const effectiveToken = token || inMemoryToken;
  if (effectiveToken) {
    requestHeaders.Authorization = `Bearer ${effectiveToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...customConfig,
      credentials: credentials || "include",
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError(
      "Network connection error. Could not reach the server.",
      0,
      "NETWORK_ERROR",
      error
    );
  }

  let responseData: unknown = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    throw parseApiError(response.status, responseData);
  }

  return responseData as T;
}

/**
 * REST HTTP helper methods.
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
