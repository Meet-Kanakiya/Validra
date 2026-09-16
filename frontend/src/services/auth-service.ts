/**
 * Authentication Service for Validra.
 * Encapsulates all authentication network operations using the centralized API client.
 */

import { apiClient, setAuthToken } from "@/services/api";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/types/auth";

/**
 * Isolated authentication endpoint definitions.
 * Configured with standard `/api/auth/*` route conventions to integrate
 * with the FastAPI backend or NextAuth authentication router.
 */
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  VERIFY_EMAIL: "/api/auth/verify-email",
  RESEND_VERIFICATION: "/api/auth/resend-verification",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_TOKEN: "/api/auth/verify-token",
} as const;

export const authService = {
  /**
   * Authenticate inspector/admin using email and password.
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, payload);
    if (response?.accessToken) {
      setAuthToken(response.accessToken);
    }
    return response;
  },

  /**
   * Clear active authentication state and token.
   */
  async logout(): Promise<void> {
    setAuthToken(null);
  },

  /**
   * Register a new inspector account.
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, payload);
  },

  /**
   * Verify an inspector email address with a confirmation token.
   */
  async verifyEmail(payload: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return apiClient.post<VerifyEmailResponse>(
      AUTH_ENDPOINTS.VERIFY_EMAIL,
      payload
    );
  },

  /**
   * Request a new email verification link.
   */
  async resendVerification(
    payload: ResendVerificationRequest
  ): Promise<ResendVerificationResponse> {
    return apiClient.post<ResendVerificationResponse>(
      AUTH_ENDPOINTS.RESEND_VERIFICATION,
      payload
    );
  },

  /**
   * Request a password reset link for the provided email.
   */
  async forgotPassword(
    payload: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return apiClient.post<ForgotPasswordResponse>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      payload
    );
  },

  /**
   * Submit new password along with a reset token.
   */
  async resetPassword(
    payload: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return apiClient.post<ResetPasswordResponse>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      payload
    );
  },

  /**
   * Validate session / bearer token and return user profile details.
   */
  async verifyToken(token: string): Promise<User> {
    return apiClient.post<User>(
      AUTH_ENDPOINTS.VERIFY_TOKEN,
      {},
      { token }
    );
  },
};
