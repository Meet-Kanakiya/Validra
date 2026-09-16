"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MetrologyRule } from "@/types/rule";
import { createMetrologyRule } from "@/services/admin-rule-service";
import { AdminPageHeader, RuleForm } from "@/components/admin";
import { Button } from "@/components/shared";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateRulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: Partial<MetrologyRule>) => {
    setIsSubmitting(true);
    try {
      await createMetrologyRule(data);
      router.push("/admin/rules");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Link href="/admin/rules">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Rules Repository</span>
          </Button>
        </Link>
      </div>

      <AdminPageHeader
        title="Author New Statutory Metrology Rule"
        subtitle="Define deterministic compliance logic, penalty severities, and legal statutory references"
        badge="New Rule Form"
      />

      <RuleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
