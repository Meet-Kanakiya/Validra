"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminUser, UserRole, UserStatus, SystemInspection } from "@/types/admin";
import {
  getAdminUserById,
  updateUserRole,
  toggleUserStatus,
} from "@/services/admin-user-service";
import { getSystemInspections } from "@/services/admin-inspection-service";
import { AdminPageHeader, UserDetailCard, AdminEmptyState } from "@/components/admin";
import { Button, Card } from "@/components/shared";
import { ArrowLeft, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [inspections, setInspections] = React.useState<SystemInspection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      getAdminUserById(userId),
      getSystemInspections(),
    ]).then(([u, allInsp]) => {
      setUser(u);
      setInspections(allInsp.filter((i) => i.inspectorId === userId || i.inspectorName === u?.name));
      setIsLoading(false);
    });
  }, [userId]);

  const handleRoleChange = async (newRole: UserRole) => {
    if (!user) return;
    const updated = await updateUserRole(user.id, newRole);
    setUser(updated);
  };

  const handleStatusToggle = async (newStatus: UserStatus) => {
    if (!user) return;
    const updated = await toggleUserStatus(user.id, newStatus);
    setUser(updated);
  };

  if (!user && !isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/users")}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Officers</span>
        </Button>
        <AdminEmptyState
          title="User Not Found"
          description="The requested statutory officer account does not exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Officers Directory</span>
          </Button>
        </Link>
      </div>

      <AdminPageHeader
        title={user?.name || "Officer Profile"}
        subtitle="Individual profile details, jurisdictional assignment, and historical package inspection audits"
        badge={user?.role?.toUpperCase()}
      />

      {user && (
        <UserDetailCard
          user={user}
          onRoleChange={handleRoleChange}
          onStatusToggle={handleStatusToggle}
        />
      )}

      {/* Officer Inspection History */}
      <Card className="p-6 border-slate-200 bg-white shadow-xs rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Recent Field Inspections Filed by Officer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspections conducted and signed under Legal Metrology Act, 2009
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {inspections.length} recorded
          </span>
        </div>

        {inspections.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Inspection ID</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-green-700 hover:text-green-800">
                      <Link href={`/admin/inspections/${insp.id}`}>{insp.id}</Link>
                    </td>
                    <td className="py-3 px-3 text-slate-900 font-medium">{insp.productName}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                          insp.status === "COMPLIANT"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : insp.status === "NEEDS_REVIEW"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {insp.status === "COMPLIANT" && <ShieldCheck className="w-3 h-3" />}
                        {insp.status === "NEEDS_REVIEW" && <AlertTriangle className="w-3 h-3" />}
                        {insp.status === "NON_COMPLIANT" && <XCircle className="w-3 h-3" />}
                        <span>{insp.status.replace("_", " ")}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-slate-900">
                      {insp.complianceScore}%
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-slate-500 text-[11px]">
                      {insp.scannedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No historical inspections found for this officer yet.
          </div>
        )}
      </Card>
    </div>
  );
}
