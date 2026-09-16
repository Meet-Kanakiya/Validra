"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, getUserFriendlyErrorMessage } from "@/services/api";

interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Reusable RegisterForm component with client-side validation,
 * dynamic password strength meter, real auth-service integration, and error alerts.
 */
export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading: isAuthChecking } = useAuth();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<RegisterFormErrors>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Prevent already-authenticated users from staying on register page
  React.useEffect(() => {
    if (!isAuthChecking && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthChecking, isAuthenticated, router]);

  // Email format regular expression (RFC 5322 subset)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = (): boolean => {
    const nextErrors: RegisterFormErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

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

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      const response = await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      // If email verification is required or user is not verified yet
      if (response?.requiresEmailVerification || !response?.user?.isVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        router.push("/login");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_ALREADY_REGISTERED") {
          setServerError("An account with this email address already exists. Please sign in instead.");
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
            {serverError.includes("sign in") && (
              <div className="mt-1">
                <Link
                  href="/login"
                  className="text-emerald-700 hover:text-emerald-800 font-medium underline underline-offset-2"
                >
                  Go to sign in &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Full Name Field */}
      <div>
        <label
          htmlFor="register-fullname"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Full name
        </label>
        <input
          id="register-fullname"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          placeholder="Enter your full name"
          value={fullName}
          disabled={isSubmitting}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) {
              setErrors((prev) => ({ ...prev, fullName: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullname-error" : undefined}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            errors.fullName
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          )}
        />
        {errors.fullName && (
          <p id="fullname-error" role="alert" className="text-xs text-rose-600 mt-1.5 font-medium">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="register-email"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Email address
        </label>
        <input
          id="register-email"
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
          htmlFor="register-password"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Create a password"
            value={password}
            disabled={isSubmitting}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
              // If confirm password was already entered, recheck match
              if (confirmPassword && errors.confirmPassword && e.target.value === confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
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

        {/* Dynamic Password Strength Meter */}
        <PasswordStrengthMeter password={password} />
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="register-confirm-password"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Re-enter your password"
            value={confirmPassword}
            disabled={isSubmitting}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            className={cn(
              "w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50/70 border text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              errors.confirmPassword
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            )}
          />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 rounded-lg transition-colors disabled:pointer-events-none"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="confirm-password-error" role="alert" className="text-xs text-rose-600 mt-1.5 font-medium">
            {errors.confirmPassword}
          </p>
        )}
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
            <span>Creating account...</span>
          </>
        ) : (
          "Create account"
        )}
      </Button>

      {/* Sign In Link */}
      <div className="pt-2 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-600 hover:text-emerald-700 font-semibold underline-offset-4 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xs"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
