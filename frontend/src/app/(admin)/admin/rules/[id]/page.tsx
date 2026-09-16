"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { MetrologyRule } from "@/types/rule";
import {
  getMetrologyRuleById,
  updateMetrologyRule,
  deleteMetrologyRule,
} from "@/services/admin-rule-service";
import {
  AdminPageHeader,
  RuleForm,
  RuleVersionHistory,
  DeleteRuleDialog,
  AdminEmptyState,
} from "@/components/admin";
import { Button } from "@/components/shared";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditRulePage() {
  const params = useParams();
  const router = useRouter();
  const ruleId = params.id as string;

  const [rule, setRule] = React.useState<MetrologyRule | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    getMetrologyRuleById(ruleId).then((data) => {
      setRule(data);
      setIsLoading(false);
    });
  }, [ruleId]);

  const handleUpdate = async (data: Partial<MetrologyRule>) => {
    if (!rule) return;
    setIsSubmitting(true);
    try {
      await updateMetrologyRule(rule.id, data);
      router.push("/admin/rules");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!rule) return;
    await deleteMetrologyRule(rule.id);
    setIsDeleteDialogOpen(false);
    router.push("/admin/rules");
  };

  if (!rule && !isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/rules")}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rules</span>
        </Button>
        <AdminEmptyState
          title="Rule Not Found"
          description="The requested statutory metrology rule entry does not exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Link href="/admin/rules">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Rules Repository</span>
          </Button>
        </Link>

        {rule && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Rule</span>
          </Button>
        )}
      </div>

      <AdminPageHeader
        title={`Configure Rule ${rule?.ruleCode || ""}: ${rule?.field || ""}`}
        subtitle="Manage deterministic pattern logic, legal reference citations, and version history"
        badge={rule?.version}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {rule && (
            <RuleForm
              initialData={rule}
              isEditMode={true}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        <div>{rule && <RuleVersionHistory history={rule.versionHistory} />}</div>
      </div>

      {rule && (
        <DeleteRuleDialog
          isOpen={isDeleteDialogOpen}
          ruleCode={rule.ruleCode}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}
