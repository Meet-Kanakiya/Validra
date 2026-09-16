"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { SystemInspection } from "@/types/admin";
import {
  getSystemInspections,
  exportInspectionsCsv,
} from "@/services/admin-inspection-service";
import {
  AdminPageHeader,
  InspectionFilters,
  AllInspectionsTable,
  AdminEmptyState,
} from "@/components/admin";
import { FileCheck2 } from "lucide-react";

function InspectionsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";

  const [inspections, setInspections] = React.useState<SystemInspection[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [inspectorFilter, setInspectorFilter] = React.useState("ALL");

  React.useEffect(() => {
    getSystemInspections().then((data) => {
      setInspections(data);
    });
  }, []);

  const handleExportCsv = () => {
    const csvContent = exportInspectionsCsv(filteredInspections);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `validra_inspections_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInspections = inspections.filter((i) => {
    const matchesSearch =
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.brandName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
    const matchesInspector =
      inspectorFilter === "ALL" || i.inspectorName === inspectorFilter;

    return matchesSearch && matchesStatus && matchesInspector;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="All Field Inspections (System Oversight)"
        subtitle="Full read-only audit log of automated and officer-reviewed package inspections across all districts"
        badge={`${inspections.length} Records`}
      />

      <InspectionFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        inspectorFilter={inspectorFilter}
        onInspectorFilterChange={setInspectorFilter}
        onExportCsv={handleExportCsv}
      />

      {filteredInspections.length > 0 ? (
        <AllInspectionsTable inspections={filteredInspections} />
      ) : (
        <AdminEmptyState
          icon={FileCheck2}
          title="No Inspections Match Criteria"
          description="Adjust your search query or filter tags to locate package verification records."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setStatusFilter("ALL");
            setInspectorFilter("ALL");
          }}
        />
      )}
    </div>
  );
}

export default function AdminInspectionsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 font-mono text-xs">
          Loading inspections oversight ledger...
        </div>
      }
    >
      <InspectionsContent />
    </React.Suspense>
  );
}
