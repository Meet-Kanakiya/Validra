"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, getUserFriendlyErrorMessage } from "@/services/api";

interface FormErrors {
  email?: string;
  password?: string;
}

/**
 * Reusable LoginForm component with client-side validation,
 * real auth-service integration, error banners, and password visibility toggle.
 */
export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: isAuthChecking } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Prevent already-authenticated users from staying on login page
  React.useEffect(() => {
    if (!isAuthChecking && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthChecking, isAuthenticated, router]);

  // Email format regular expression (RFC 5322 subset)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        email: email.trim(),
        password,
        rememberMe,
      });

      // If user requires email verification, navigate to verification screen
      if (response?.user && !response.user.isVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "INVALID_CREDENTIALS") {
          setServerError("Invalid email address or password. Please check your credentials.");
        } else if (err.status === 403 || err.message.toLowerCase().includes("verify")) {
          setServerError("Your account requires email verification before signing in.");
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError(getUserFriendlyErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {/* Top Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <span>{serverError}</span>
            {serverError.includes("verification") && (
              <div className="mt-1">
                <Link
                  href={`/verify-email?email=${encodeURIComponent(email.trim())}`}
                  className="text-emerald-700 hover:text-emerald-800 font-medium underline underline-offset-2"
                >
                  Go to email verification &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Email Field */}
      <div>
        <label
          htmlFor="login-email"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          disabled={isSubmitting}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            errors.email
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          )}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-rose-600 mt-1.5 font-medium">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="login-password"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={password}
            disabled={isSubmitting}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={cn(
              "w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50/70 border text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              errors.password
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            )}
          />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 rounded-lg transition-colors disabled:pointer-events-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="text-xs text-rose-600 mt-1.5 font-medium">
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-800">
          <input
            type="checkbox"
            id="remember-me"
            name="rememberMe"
            checked={rememberMe}
            disabled={isSubmitting}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500/30 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-emerald-600"
          />
          <span>Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-slate-500 hover:text-emerald-700 font-medium transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 transition-all mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      {/* Register Link */}
      <div className="pt-2 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-emerald-600 hover:text-emerald-700 font-semibold underline-offset-4 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xs"
        >
          Create one
        </Link>
      </div>
    </form>
  );
}
