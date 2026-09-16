import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register to access your Validra Legal Metrology inspection workspace.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Register to access your VALIDRA workspace."
    >
      <RegisterForm />
    </AuthCard>
  );
}
