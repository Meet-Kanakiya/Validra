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

// Module-level reactive store shared across components without wrapping root layout
let authStore: AuthStore = {
  user: null,
  isLoading: true, // starts in checking lifecycle state
  hasChecked: false,
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
      await authService.logout();
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
