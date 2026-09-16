"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

/**
 * Reusable ForgotPasswordForm component with client-side validation,
 * simulated submit flow, confirmation state, resend cooldown timer, and accessible navigation.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [resendSuccess, setResendSuccess] = React.useState(false);

  // Email validation regex (RFC 5322 subset)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Manage 30-second cooldown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const validate = (): boolean => {
    if (!email.trim()) {
      setError("Email address is required.");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError(undefined);
    return true;
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
      setIsSubmitted(true);
      setCooldown(30);
    }, 1000);
  };

  const handleResend = () => {
    if (isResending || cooldown > 0) return;

    setIsResending(true);
    setResendSuccess(false);

    setTimeout(() => {
      setIsResending(false);
      setResendSuccess(true);
      setCooldown(30);
    }, 1000);
  };

  const handleTryAnotherEmail = () => {
    setIsSubmitted(false);
    setResendSuccess(false);
    setError(undefined);
  };

  // Confirmation Success State
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-1">
        {/* Mail Icon Badge */}
        <div
          className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5"
          aria-hidden="true"
        >
          <MailCheck className="w-6 h-6" />
        </div>

        {/* Confirmation Copy */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold tracking-tight text-white">
            Check your email
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
            If an account exists for this email address, we&apos;ve sent instructions to reset your password.
          </p>
        </div>

        {/* Subtly Displayed Email Address */}
        <div className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
          <span>Reset link sent to </span>
          <span className="font-semibold text-zinc-200 break-all">{email}</span>
        </div>

        {/* Resend Confirmation Banner */}
        {resendSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium w-full"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>Reset instructions re-sent successfully.</span>
          </div>
        )}

        {/* Success Actions */}
        <div className="w-full space-y-3 pt-2">
          <Button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="w-full h-10 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Sending...</span>
              </>
            ) : cooldown > 0 ? (
              `You can request another email in ${cooldown}s`
            ) : (
              "Send again"
            )}
          </Button>

          <div className="flex items-center justify-between gap-4 pt-1 text-xs text-zinc-400">
            <button
              type="button"
              onClick={handleTryAnotherEmail}
              className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:underline cursor-pointer"
            >
              Try another email
            </button>
            <Link
              href="/login"
              className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Primary Input Form
  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {/* Email Field */}
      <div>
        <label
          htmlFor="forgot-email"
          className="block text-xs font-medium text-zinc-300 mb-1.5"
        >
          Email address
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          disabled={isLoading}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) {
              setError(undefined);
            }
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "forgot-email-error" : undefined}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              : "border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          )}
        />
        {error && (
          <p id="forgot-email-error" role="alert" className="text-xs text-rose-400 mt-1.5">
            {error}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/25 transition-all mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Sending...</span>
          </>
        ) : (
          "Send reset link"
        )}
      </Button>

      {/* Back to Login Link */}
      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </form>
  );
}
