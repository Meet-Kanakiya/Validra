import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to access your Validra Legal Metrology workspace.",
};

interface VerifyEmailPageProps {
  searchParams?: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const email =
    typeof resolvedParams?.email === "string"
      ? resolvedParams.email
      : undefined;

  return (
    <AuthCard>
      <VerifyEmailCard email={email} />
    </AuthCard>
  );
}
