import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new secure password for your Validra Legal Metrology workspace.",
};

interface ResetPasswordPageProps {
  searchParams?: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const token =
    typeof resolvedParams?.token === "string" && resolvedParams.token.trim().length > 0
      ? resolvedParams.token.trim()
      : undefined;

  return (
    <AuthCard
      title={token ? "Reset your password" : undefined}
      description={
        token
          ? "Enter your new password below to secure your account."
          : undefined
      }
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
