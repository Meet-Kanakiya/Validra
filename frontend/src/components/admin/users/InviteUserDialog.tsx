"use client";

import * as React from "react";
import { X, UserPlus } from "lucide-react";
import { Button, Input } from "@/components/shared";
import { UserRole } from "@/types/admin";
import { inviteInspector } from "@/services/admin-user-service";

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserInvited: () => void;
}

export function InviteUserDialog({ isOpen, onClose, onUserInvited }: InviteUserDialogProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [jurisdiction, setJurisdiction] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("inspector");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      await inviteInspector({ name, email, jurisdiction, role });
      setName("");
      setEmail("");
      setJurisdiction("");
      onUserInvited();
      onClose();
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center justify-center">
            <UserPlus className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Invite Legal Metrology Officer</h3>
            <p className="text-xs text-slate-500">
              Sends an official statutory onboarding email with credentials activation link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Officer Full Name
            </label>
            <Input
              required
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Email Address
            </label>
            <Input
              required
              type="email"
              placeholder="officer.name@lm.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-700"
              >
                <option value="inspector">Field Inspector</option>
                <option value="supervisor">District Supervisor</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State Jurisdiction / District
              </label>
              <Input
                placeholder="e.g. Gujarat - Ahmedabad"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Dispatching..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
