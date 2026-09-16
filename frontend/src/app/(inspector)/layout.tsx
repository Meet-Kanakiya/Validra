"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoadingState } from "@/components/auth/AuthLoadingState";
import { InspectorShell } from "@/components/inspector/layout/InspectorShell";

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // While session is being determined, render minimal, accessible loading state
  if (isLoading) {
    return <AuthLoadingState message="Verifying inspector authorization..." />;
  }

  // Prevent flash of protected content while redirecting unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return <InspectorShell>{children}</InspectorShell>;
}
