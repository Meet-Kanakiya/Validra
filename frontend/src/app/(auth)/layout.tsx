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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white antialiased">
      {/* Subtle ambient lighting effect - restrained, crisp, and professional */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.08),transparent_70%)]"
        aria-hidden="true"
      />
      {/* Subtle institutional micro-grid */}
      <div
        className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"
        aria-hidden="true"
      />

      {/* Centered Main Authentication Content Canvas */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* Institutional Legal & Regulatory Notice */}
      <footer className="relative py-4 px-6 text-center text-xs text-slate-500 select-none border-t border-slate-200/60 bg-white/50 backdrop-blur-xs">
        <p>
          Official Compliance &bull; Legal Metrology Act, 2009 &bull; Government of India
        </p>
      </footer>
    </div>
  );
}
