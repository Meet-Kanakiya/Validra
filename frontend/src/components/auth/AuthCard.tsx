import * as React from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/shared/ui/card";

export interface AuthCardProps {
  /** Page title heading */
  title?: React.ReactNode;
  /** Subtitle or explanatory text */
  description?: React.ReactNode;
  /** Optional bottom footer area for alternate links/terms */
  footer?: React.ReactNode;
  /** Whether to render the Validra brand logo (default: true) */
  showLogo?: boolean;
  /** Custom logo or header node override */
  headerAction?: React.ReactNode;
  /** Additional container classes */
  className?: string;
  /** Card body content (forms, inputs, actions) */
  children: React.ReactNode;
}

/**
 * Reusable authentication card wrapper component for all auth pages.
 * Integrates institutional Validra branding, semantic headers, and accessible structure.
 */
export function AuthCard({
  title,
  description,
  footer,
  showLogo = true,
  headerAction,
  className,
  children,
}: AuthCardProps) {
  return (
    <section aria-labelledby={title ? "auth-card-title" : undefined} className={cn("w-full max-w-md mx-auto", className)}>
      <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-200/60 p-6 sm:p-8">
        {(showLogo || headerAction || title || description) && (
          <CardHeader className="flex flex-col items-center text-center pb-6 pt-0 px-0">
            {showLogo && (
              <div className="mb-4">
                <Logo size="md" />
              </div>
            )}
            {headerAction && (
              <div className="mb-3">
                {headerAction}
              </div>
            )}
            {title && (
              <CardTitle id="auth-card-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm text-slate-500 mt-1.5 max-w-xs">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}

        <CardContent className="px-0 pt-0">
          {children}
        </CardContent>

        {footer && (
          <CardFooter className="px-0 pb-0 pt-6 border-t border-slate-100 flex flex-col items-center justify-center text-xs text-slate-500">
            {footer}
          </CardFooter>
        )}
      </Card>
    </section>
  );
}
