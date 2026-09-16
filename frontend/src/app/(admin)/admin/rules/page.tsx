"use client";

import * as React from "react";
import Link from "next/link";
import { MetrologyRule } from "@/types/rule";
import { getMetrologyRules } from "@/services/admin-rule-service";
import {
  AdminPageHeader,
  RuleFilters,
  RuleTable,
  AdminEmptyState,
} from "@/components/admin";
import { Button } from "@/components/shared";
import { Plus, Scale } from "lucide-react";

export default function AdminRulesPage() {
  const [rules, setRules] = React.useState<MetrologyRule[]>([]);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [severityFilter, setSeverityFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  React.useEffect(() => {
    getMetrologyRules().then(setRules);
  }, []);

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.ruleCode.toLowerCase().includes(search.toLowerCase()) ||
      r.field.toLowerCase().includes(search.toLowerCase()) ||
      r.legalReference.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesSeverity = severityFilter === "ALL" || r.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Statutory Metrology Rules (C01–C26)"
        subtitle="Configure deterministic rule definitions, regex patterns, and statutory penalties under Packaged Commodities Rules 2011"
        badge={`${rules.length} Rules Defined`}
      >
        <Link href="/admin/rules/new">
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white font-medium gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Statutory Rule</span>
          </Button>
        </Link>
      </AdminPageHeader>

      <RuleFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {filteredRules.length > 0 ? (
        <RuleTable rules={filteredRules} />
      ) : (
        <AdminEmptyState
          icon={Scale}
          title="No Rules Match Filter"
          description="Adjust your search criteria or create a new legal metrology rule entry."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setCategoryFilter("ALL");
            setSeverityFilter("ALL");
            setStatusFilter("ALL");
          }}
        />
      )}
    </div>
  );
}
