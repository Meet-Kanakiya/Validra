"use client";

import * as React from "react";
import { ShieldCheck, Mail, MapPin, Building, LogOut, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/inspector/common";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const fullName = user?.fullName || "Field Inspector Officer";
  const email = user?.email || "officer@nic.in";
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "IN";

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Inspector Profile"
        description="Official identification, assigned metrology jurisdiction, and active session credentials."
      />

      {/* Profile Overview Card */}
      <section
        aria-label="Officer Profile Overview"
        className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold font-mono shrink-0">
            {initials}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {fullName}
              </h2>
              <Badge variant="success" className="gap-1 text-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>Authorized Officer</span>
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Senior Legal Metrology Inspector &bull; ID #IND-409
            </p>
          </div>
        </div>

        {/* Officer Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/60">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-500 block text-[11px] uppercase tracking-wider font-semibold">
                Official Email
              </span>
              <span className="text-zinc-200 font-mono text-xs">{email}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/60">
            <Building className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-500 block text-[11px] uppercase tracking-wider font-semibold">
                Department
              </span>
              <span className="text-zinc-200 text-xs">
                Legal Metrology Department, Ministry of Consumer Affairs
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/60">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-500 block text-[11px] uppercase tracking-wider font-semibold">
                Jurisdiction
              </span>
              <span className="text-zinc-200 text-xs">
                Western Region &bull; Zone 1 Field Enforcement Division
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-500 block text-[11px] uppercase tracking-wider font-semibold">
                Statutory Authority
              </span>
              <span className="text-zinc-200 text-xs">
                Legal Metrology Act, 2009 &bull; Section 15 Powers of Inspection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Session & Security Actions */}
      <section
        aria-label="Account Session"
        className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-semibold text-white">
            Active Session Security
          </h3>
          <p className="text-xs text-zinc-400">
            Signed in via Government NIC single sign-on / credential authentication.
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => logout()}
          className="gap-2 text-xs font-semibold cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out of Inspector Session</span>
        </Button>
      </section>
    </div>
  );
}
