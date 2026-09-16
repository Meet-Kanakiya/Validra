import type { Metadata } from "next";
import {
  getDashboardOverviewMetrics,
  getViolationHeatmap,
  getTopViolations,
  getInspectorActivityList,
  getPendingReviewsCount,
} from "@/services/admin-dashboard-service";
import {
  AdminPageHeader,
  SystemStatsGrid,
  ComplianceRateCard,
  InspectionTrendChart,
  ViolationHeatmap,
  TopViolationsTable,
  InspectorActivityTable,
  PendingReviewsCard,
} from "@/components/admin";

export const metadata: Metadata = {
  title: "Supervisory Dashboard",
};

export default async function AdminDashboardPage() {
  const [metrics, heatmapStats, topViolations, inspectors, pendingCount] =
    await Promise.all([
      getDashboardOverviewMetrics(),
      getViolationHeatmap(),
      getTopViolations(),
      getInspectorActivityList(),
      getPendingReviewsCount(),
    ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <AdminPageHeader
        title="Enforcement Command Center"
        subtitle="National Legal Metrology compliance overview, field inspection telemetry, and statutory rule performance"
        badge="Live Telemetry"
      />

      {/* Top KPI Metrics Tiles */}
      <SystemStatsGrid metrics={metrics} />

      {/* Grid: Compliance Rate Card + Pending Reviews Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InspectionTrendChart />
        </div>
        <div className="space-y-6">
          <ComplianceRateCard />
          <PendingReviewsCard count={pendingCount} />
        </div>
      </div>

      {/* Grid: Violations Heatmap + Top Violations Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViolationHeatmap stats={heatmapStats} />
        <TopViolationsTable violations={topViolations} />
      </div>

      {/* Field Inspector Activity Performance Table */}
      <InspectorActivityTable inspectors={inspectors} />
    </div>
  );
}
