"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CircleCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

export interface ResetPasswordFormProps {
  /** The password reset token from query parameter */
  token?: string;
  /** Optional container class name */
  className?: string;
}

interface ResetFormErrors {
  password?: string;
  confirmPassword?: string;
}

/**
 * Reusable ResetPasswordForm component.
 * Handles missing-token error state, password inputs with visibility toggles,
 * dynamic password strength evaluation, client-side validation, and simulated submission.
 */
export function ResetPasswordForm({ token, className }: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<ResetFormErrors>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Missing or Invalid Token State
  if (!token) {
    return (
      <div className={cn("flex flex-col items-center text-center space-y-4 py-1", className)}>
        {/* Warning Icon Badge */}
        <div
          className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/5"
          aria-hidden="true"
        >
          <AlertCircle className="w-6 h-6" />
        </div>

        {/* Missing Token Heading & Message */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold tracking-tight text-white">
            Invalid or missing reset link
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
            This password reset link is missing or invalid. Please request a new reset link.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center w-full h-11 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/25 transition-all"
          >
            Request a new reset link
          </Link>

          <div className="pt-1">
            <Link
              href="/login"
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success Confirmation State
  if (isSuccess) {
    return (
      <div className={cn("flex flex-col items-center text-center space-y-4 py-1", className)}>
        {/* Success Icon Badge */}
        <div
          className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5"
          aria-hidden="true"
        >
          <CircleCheck className="w-6 h-6" />
        </div>

        {/* Success Copy */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            Password reset successful
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
        </div>

        {/* Action Link */}
        <div className="w-full pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full h-11 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    const nextErrors: ResetFormErrors = {};

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    // Simulate short network request
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <form className={cn("space-y-4", className)} onSubmit={handleSubmit} noValidate>
      {/* New Password Field */}
      <div>
        <label
          htmlFor="reset-password"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          New password
        </label>
        <div className="relative">
          <input
            id="reset-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Create a new password"
            value={password}
            disabled={isLoading}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
              if (confirmPassword && errors.confirmPassword && e.target.value === confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "reset-password-error" : undefined}
            className={cn(
              "w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50/70 border text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              errors.password
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            )}
          />
          <button
            type="button"
            disabled={isLoading}
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
          <p id="reset-password-error" role="alert" className="text-xs text-rose-600 mt-1.5 font-medium">
            {errors.password}
          </p>
        )}

        {/* Dynamic Password Strength Indicator */}
        <PasswordStrengthMeter password={password} />
      </div>

      {/* Confirm New Password Field */}
      <div>
        <label
          htmlFor="reset-confirm-password"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Confirm new password
        </label>
        <div className="relative">
          <input
            id="reset-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Re-enter your new password"
            value={confirmPassword}
            disabled={isLoading}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "reset-confirm-password-error" : undefined}
            className={cn(
              "w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50/70 border text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              errors.confirmPassword
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            )}
          />
          <button
            type="button"
            disabled={isLoading}
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
          <p id="reset-confirm-password-error" role="alert" className="text-xs text-rose-600 mt-1.5 font-medium">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 transition-all mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Resetting password...</span>
          </>
        ) : (
          "Reset password"
        )}
      </Button>

      {/* Back to Sign In Link */}
      <div className="pt-2 text-center text-xs text-slate-500">
        <Link
          href="/login"
          className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:underline font-medium"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
