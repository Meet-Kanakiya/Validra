"use client";

import * as React from "react";
import { AdminUser, UserRole, UserStatus } from "@/types/admin";
import { Card, Button } from "@/components/shared";
import {
  Clock,
  MapPin,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

interface UserDetailCardProps {
  user: AdminUser;
  onRoleChange: (newRole: UserRole) => void;
  onStatusToggle: (newStatus: UserStatus) => void;
}

export function UserDetailCard({
  user,
  onRoleChange,
  onStatusToggle,
}: UserDetailCardProps) {
  const [pendingRole, setPendingRole] = React.useState<UserRole | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = React.useState(false);

  const isCurrentAdmin = user.email === "admin@validra.gov.in";

  return (
    <div className="space-y-5">
      {/* Profile Overview Card */}
      <Card className="p-5 border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 text-green-800 font-bold text-lg flex items-center justify-center font-mono">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                    user.status === "active"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={isCurrentAdmin}
              onClick={() => setIsStatusDialogOpen(true)}
              className={user.status === "active" ? "hover:border-rose-300 hover:text-rose-700" : ""}
            >
              {user.status === "active" ? "Deactivate Account" : "Activate Account"}
            </Button>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Assigned Role</span>
            <div className="flex items-center gap-2">
              <select
                value={user.role}
                disabled={isCurrentAdmin}
                onChange={(e) => setPendingRole(e.target.value as UserRole)}
                className="h-8 px-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-green-700 disabled:opacity-50"
              >
                <option value="inspector">Inspector</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Jurisdiction</span>
            <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.jurisdiction || "National / Unassigned"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Inspections Filed</span>
            <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-green-700" />
              <span className="font-mono font-bold text-slate-900">{user.inspectionsCount}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Last Active</span>
            <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.lastActive}</span>
            </div>
          </div>
        </div>

        {isCurrentAdmin && (
          <div className="mt-5 p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-purple-600" />
            <span>This is your active supervisory admin account. Self-deactivation and self-demotion are disabled for security safety.</span>
          </div>
        )}
      </Card>

      {/* Role Change Confirmation */}
      <ConfirmationDialog
        isOpen={pendingRole !== null}
        title="Confirm Role Change"
        message={`Are you sure you want to change ${user.name}'s role from "${user.role}" to "${pendingRole}"? This modifies statutory permissions immediately.`}
        confirmLabel="Confirm Role Change"
        onConfirm={() => {
          if (pendingRole) {
            onRoleChange(pendingRole);
            setPendingRole(null);
          }
        }}
        onCancel={() => setPendingRole(null)}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmationDialog
        isOpen={isStatusDialogOpen}
        title={user.status === "active" ? "Deactivate Officer Account?" : "Activate Officer Account?"}
        message={
          user.status === "active"
            ? `Deactivating ${user.name} will revoke their access to the mobile scan tool and inspector workspace.`
            : `Activating ${user.name} will allow them to login and conduct statutory package inspections immediately.`
        }
        confirmLabel={user.status === "active" ? "Deactivate Account" : "Activate Account"}
        isDestructive={user.status === "active"}
        onConfirm={() => {
          onStatusToggle(user.status === "active" ? "inactive" : "active");
          setIsStatusDialogOpen(false);
        }}
        onCancel={() => setIsStatusDialogOpen(false)}
      />
    </div>
  );
}
