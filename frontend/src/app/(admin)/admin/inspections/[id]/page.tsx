"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { SystemInspection } from "@/types/admin";
import { getSystemInspectionById } from "@/services/admin-inspection-service";
import { AdminPageHeader, InspectionDetailView, AdminEmptyState } from "@/components/admin";
import { Button } from "@/components/shared";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params.id as string;

  const [inspection, setInspection] = React.useState<SystemInspection | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getSystemInspectionById(inspectionId).then((data) => {
      setInspection(data);
      setIsLoading(false);
    });
  }, [inspectionId]);

  if (!inspection && !isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/inspections")}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inspections</span>
        </Button>
        <AdminEmptyState
          title="Inspection Record Not Found"
          description="The requested inspection certificate or case record could not be found."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Link href="/admin/inspections">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Inspections Oversight</span>
          </Button>
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          <span>Admin Read-Only Mode (Decisions Sealed)</span>
        </div>
      </div>

      <AdminPageHeader
        title={`Inspection Record: ${inspection?.id || ""}`}
        subtitle="Supervisory read-only examination of field findings, rule verdicts, and court-admissible metadata"
        badge={inspection?.status}
      />

      {inspection && <InspectionDetailView inspection={inspection} />}
    </div>
  );
}
