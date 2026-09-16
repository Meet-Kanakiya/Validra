import * as React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Secure access portal for the Validra Legal Metrology Verification System.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950 antialiased">
      {/* Subtle ambient lighting effect - restrained and professional */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.04),transparent_60%)]"
        aria-hidden="true"
      />

      {/* Centered Main Authentication Content Canvas */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* Institutional Legal & Regulatory Notice */}
      <footer className="relative py-4 px-6 text-center text-xs text-zinc-400 select-none">
        <p>
          Official Compliance &bull; Legal Metrology Act, 2009 &bull; Government of India
        </p>
      </footer>
    </div>
  );
}
