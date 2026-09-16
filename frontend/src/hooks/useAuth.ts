"use client";

import * as React from "react";
import { authService } from "@/services/auth-service";
import {
  apiClient,
  getAuthToken,
  getUserFriendlyErrorMessage,
} from "@/services/api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "@/types/auth";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  hasChecked: boolean;
  error: string | null;
}

// ============================================================================
// TODO: TEMPORARY DEVELOPMENT-ONLY AUTHENTICATION BYPASS FOR FRONTEND UI TESTING
// Allows manual inspection testing of the complete Inspector frontend when backend/DB is not connected.
// This bypass is strictly disabled in production builds (process.env.NODE_ENV !== "development").
// To disable in development: set NEXT_PUBLIC_DEV_AUTH_BYPASS=false in frontend/.env
// ============================================================================
const IS_DEV_BYPASS_ACTIVE =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

const DEV_INSPECTOR_USER: User = {
  id: "dev-inspector-01",
  email: "inspector.sharma@validra.gov.in",
  fullName: "Inspector Sharma",
  role: "inspector",
  isActive: true,
  isVerified: true,
  badgeNumber: "LM-DEL-2024-089",
  jurisdiction: "Delhi NCR - Central Zone",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

// Module-level reactive store shared across components without wrapping root layout
let authStore: AuthStore = {
  user: IS_DEV_BYPASS_ACTIVE ? DEV_INSPECTOR_USER : null,
  isLoading: IS_DEV_BYPASS_ACTIVE ? false : true,
  hasChecked: IS_DEV_BYPASS_ACTIVE,
  error: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function setStore(updater: Partial<AuthStore>) {
  authStore = { ...authStore, ...updater };
  notify();
}

let checkPromise: Promise<User | null> | null = null;

/**
 * Verify current session with the backend.
 * Checks in-memory token or HTTP-only cookies if present.
 */
export async function checkAuth(): Promise<User | null> {
  if (IS_DEV_BYPASS_ACTIVE) {
    setStore({
      user: DEV_INSPECTOR_USER,
      isLoading: false,
      hasChecked: true,
      error: null,
    });
    return DEV_INSPECTOR_USER;
  }

  if (checkPromise) return checkPromise;

  setStore({ isLoading: true, error: null });

  checkPromise = (async () => {
    try {
      const token = getAuthToken();
      let currentUser: User | null = null;

      if (token) {
        try {
          currentUser = await authService.verifyToken(token);
        } catch {
          currentUser = null;
        }
      }

      if (!currentUser) {
        try {
          // If HTTP-only session cookie is available, check current user profile
          currentUser = await apiClient.get<User>("/api/users/me");
        } catch {
          currentUser = null;
        }
      }

      setStore({
        user: currentUser,
        isLoading: false,
        hasChecked: true,
      });
      return currentUser;
    } catch {
      setStore({
        user: null,
        isLoading: false,
        hasChecked: true,
      });
      return null;
    } finally {
      checkPromise = null;
    }
  })();

  return checkPromise;
}

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  checkAuth: () => Promise<User | null>;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Reusable authentication hook providing reactive user state,
 * session verification lifecycle, and authentication actions.
 */
export function useAuth(): UseAuthReturn {
  const store = React.useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => authStore,
    () => authStore
  );

  React.useEffect(() => {
    if (!authStore.hasChecked) {
      checkAuth();
    }
  }, []);

  const login = React.useCallback(
    async (credentials: LoginRequest): Promise<LoginResponse> => {
      setStore({ isLoading: true, error: null });
      if (IS_DEV_BYPASS_ACTIVE) {
        setStore({
          user: DEV_INSPECTOR_USER,
          isLoading: false,
          hasChecked: true,
        });
        return {
          user: DEV_INSPECTOR_USER,
          accessToken: "dev-mock-bypass-token",
          tokenType: "Bearer",
        };
      }
      try {
        const response = await authService.login(credentials);
        if (response?.user) {
          setStore({
            user: response.user,
            isLoading: false,
            hasChecked: true,
          });
        } else {
          setStore({ isLoading: false, hasChecked: true });
        }
        return response;
      } catch (err) {
        const friendlyMessage = getUserFriendlyErrorMessage(err);
        setStore({
          error: friendlyMessage,
          isLoading: false,
          hasChecked: true,
        });
        throw err;
      }
    },
    []
  );

  const register = React.useCallback(
    async (data: RegisterRequest): Promise<RegisterResponse> => {
      setStore({ isLoading: true, error: null });
      try {
        const response = await authService.register(data);
        setStore({ isLoading: false, hasChecked: true });
        return response;
      } catch (err) {
        const friendlyMessage = getUserFriendlyErrorMessage(err);
        setStore({
          error: friendlyMessage,
          isLoading: false,
          hasChecked: true,
        });
        throw err;
      }
    },
    []
  );

  const logout = React.useCallback(async (): Promise<void> => {
    setStore({ isLoading: true });
    try {
      if (!IS_DEV_BYPASS_ACTIVE) {
        await authService.logout();
      }
      setStore({
        user: null,
        isLoading: false,
        hasChecked: true,
      });
    } finally {
      setStore({ isLoading: false });
    }
  }, []);

  const clearError = React.useCallback(() => {
    setStore({ error: null });
  }, []);

  return {
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: Boolean(store.user),
    error: store.error,
    checkAuth,
    login,
    register,
    logout,
    clearError,
  };
}
