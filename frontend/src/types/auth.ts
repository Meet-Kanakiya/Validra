/**
 * Authentication and authorization types for the Validra platform.
 * Aligned with Domain M2 (FastAPI Backend / NextAuth) architecture.
 */

/**
 * Valid user roles within the Validra Legal Metrology inspection system.
 */
export type UserRole = "inspector" | "admin";

/**
 * User account profile.
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  badgeNumber?: string;
  jurisdiction?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Authentication session payload.
 */
export interface AuthSession {
  user: User;
  token?: string;
  expiresAt?: string;
}

/**
 * Credentials payload for inspector/admin sign in.
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Response payload returned upon successful sign in.
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
}

/**
 * Registration payload for creating a new inspector account.
 */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

/**
 * Response payload returned upon account creation.
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: Partial<User>;
  requiresEmailVerification: boolean;
}

/**
 * Email verification request containing confirmation token.
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Email verification confirmation response.
 */
export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

/**
 * Request payload to resend an email verification link.
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Response payload for email verification link resend.
 */
export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

/**
 * Request payload to initiate a password reset.
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Generic response payload for password reset requests.
 */
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Request payload containing token and new password.
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Response payload confirming password reset completion.
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
