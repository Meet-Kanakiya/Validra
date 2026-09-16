"use client";

import * as React from "react";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

interface DeleteRuleDialogProps {
  isOpen: boolean;
  ruleCode: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteRuleDialog({
  isOpen,
  ruleCode,
  onConfirm,
  onCancel,
}: DeleteRuleDialogProps) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title={`Delete Statutory Rule ${ruleCode}?`}
      message={`Deleting rule ${ruleCode} will disable all future automated checks for this field across the Legal Metrology scanning engine. Past inspection audit logs and certificates will remain preserved.`}
      confirmLabel="Delete Statutory Rule"
      cancelLabel="Keep Rule"
      isDestructive={true}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
