"use client";

import * as React from "react";
import { AuditLogEntry } from "@/types/audit-log";
import { getAuditLogs } from "@/services/admin-audit-service";
import {
  AdminPageHeader,
  AuditLogFilters,
  AuditLogTable,
  AdminEmptyState,
} from "@/components/admin";
import { ShieldAlert } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("ALL");
  const [entityFilter, setEntityFilter] = React.useState("ALL");

  React.useEffect(() => {
    getAuditLogs().then((data) => {
      setLogs(data);
    });
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesEntity = entityFilter === "ALL" || log.entityType === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Security & System Audit Trail"
        subtitle="Immutable, court-verifiable security audit trail recording all rule edits, inspection overrides, and authentication attempts"
        badge="WORM Compliant"
      />

      <AuditLogFilters
        search={search}
        onSearchChange={setSearch}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        entityFilter={entityFilter}
        onEntityFilterChange={setEntityFilter}
      />

      {filteredLogs.length > 0 ? (
        <AuditLogTable logs={filteredLogs} />
      ) : (
        <AdminEmptyState
          icon={ShieldAlert}
          title="No Audit Records Found"
          description="Adjust your search query or filter tags to locate audit trail events."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setActionFilter("ALL");
            setEntityFilter("ALL");
          }}
        />
      )}
    </div>
  );
}
