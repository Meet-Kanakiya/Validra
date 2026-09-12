# Validra — Admin Module Blueprint

> **Owner:** FE-3 (Dashboard Analytics + Admin Portal)
> **Directory:** `frontend/src/app/(admin)/`
> **Isolation:** No imports from `(landing)/` or `(inspector)/` component folders.

---

## 1. Module Overview

The Admin module provides system administration capabilities for supervisors and administrators. Admin accounts are **created via Next.js CLI scripts** — there is no admin registration or admin email verification page in the frontend.

### Admin vs Inspector Distinction

| Aspect | Inspector | Admin |
|---|---|---|
| Primary task | Conduct inspections | Manage system |
| UI density | Focused workflow | Dense tables + forms |
| Data access | Own inspections | All inspections |
| Write access | Create inspections, review findings | Manage users, rules, legal docs |
| Auth flow | Register → Verify → Login | Script-created → Login |

---

## 2. File Structure

```
frontend/src/
├── app/
│   ├── (admin)/                              ← Admin route group
│   │   ├── layout.tsx                        ← AdminShell (admin sidebar + header + auth guard + role check)
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                  ← "/admin/dashboard"
│   │   │   ├── users/
│   │   │   │   ├── page.tsx                  ← "/admin/users" (user list)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx              ← "/admin/users/[id]" (user detail)
│   │   │   ├── rules/
│   │   │   │   ├── page.tsx                  ← "/admin/rules" (rule list)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx              ← "/admin/rules/new" (create rule)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx              ← "/admin/rules/[id]" (edit rule)
│   │   │   ├── legal-documents/
│   │   │   │   ├── page.tsx                  ← "/admin/legal-documents" (doc list)
│   │   │   │   └── upload/
│   │   │   │       └── page.tsx              ← "/admin/legal-documents/upload"
│   │   │   ├── inspections/
│   │   │   │   ├── page.tsx                  ← "/admin/inspections" (all inspections)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx              ← "/admin/inspections/[id]" (detail, read-only)
│   │   │   ├── audit-logs/
│   │   │   │   └── page.tsx                  ← "/admin/audit-logs"
│   │   │   └── settings/
│   │   │       └── page.tsx                  ← "/admin/settings"
│   │   └── page.tsx                          ← Redirect to /admin/dashboard
│   │
│   ├── (auth)/                               ← FE-2 owns (shared auth pages)
│   ├── (inspector)/                          ← FE-2 owns (DO NOT TOUCH)
│   └── (landing)/                            ← FE-1 owns (DO NOT TOUCH)
│
├── components/
│   ├── admin/                                ← Admin-specific components
│   │   ├── layout/
│   │   │   ├── AdminShell.tsx                ← Admin sidebar + header + content
│   │   │   ├── AdminSidebar.tsx              ← Admin navigation sidebar
│   │   │   ├── AdminHeader.tsx               ← Top bar (admin badge, user menu)
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   ├── SystemStatsGrid.tsx           ← Total inspections, users, rules, etc.
│   │   │   ├── ComplianceRateCard.tsx        ← Overall compliance percentage
│   │   │   ├── InspectionTrendChart.tsx      ← Inspections over time
│   │   │   ├── ViolationHeatmap.tsx          ← Violations by category
│   │   │   ├── TopViolationsTable.tsx        ← Most common violations
│   │   │   ├── InspectorActivityTable.tsx    ← Inspector performance
│   │   │   ├── PendingReviewsCard.tsx        ← Items awaiting review
│   │   │   └── index.ts
│   │   ├── users/
│   │   │   ├── UserTable.tsx                 ← Sortable user data table
│   │   │   ├── UserFilters.tsx               ← Role filter, status filter, search
│   │   │   ├── UserDetailCard.tsx            ← User profile + activity
│   │   │   ├── UserRoleSelect.tsx            ← Change user role
│   │   │   ├── UserStatusToggle.tsx          ← Activate / deactivate
│   │   │   ├── InviteUserDialog.tsx          ← Invite new inspector (email)
│   │   │   └── index.ts
│   │   ├── rules/
│   │   │   ├── RuleTable.tsx                 ← All rules with status
│   │   │   ├── RuleFilters.tsx               ← Category, severity, active/inactive
│   │   │   ├── RuleForm.tsx                  ← Create / edit rule form
│   │   │   ├── RuleDetailCard.tsx            ← Full rule detail view
│   │   │   ├── RuleVersionHistory.tsx        ← Version timeline
│   │   │   ├── RuleStatusBadge.tsx           ← Active / Inactive / Draft
│   │   │   ├── DeleteRuleDialog.tsx          ← Confirmation for destructive action
│   │   │   └── index.ts
│   │   ├── legal-documents/
│   │   │   ├── DocumentTable.tsx             ← Legal doc list
│   │   │   ├── DocumentUploadForm.tsx        ← PDF upload + metadata
│   │   │   ├── DocumentDetailCard.tsx        ← Doc info + chunks preview
│   │   │   ├── IngestionStatusBadge.tsx      ← Processing / Ready / Failed
│   │   │   ├── DeleteDocumentDialog.tsx
│   │   │   └── index.ts
│   │   ├── inspections/
│   │   │   ├── AllInspectionsTable.tsx        ← All inspectors' inspections
│   │   │   ├── InspectionFilters.tsx          ← Status, inspector, date, product
│   │   │   ├── InspectionDetailView.tsx       ← Read-only admin view
│   │   │   └── index.ts
│   │   ├── audit-logs/
│   │   │   ├── AuditLogTable.tsx             ← Audit log entries
│   │   │   ├── AuditLogFilters.tsx           ← User, action, entity, date range
│   │   │   ├── AuditLogDetailDialog.tsx      ← Full log entry detail
│   │   │   └── index.ts
│   │   ├── settings/
│   │   │   ├── SystemSettingsForm.tsx
│   │   │   ├── ConfidenceThresholdConfig.tsx
│   │   │   └── index.ts
│   │   ├── common/
│   │   │   ├── AdminPageHeader.tsx           ← Title + breadcrumb + actions
│   │   │   ├── AdminEmptyState.tsx
│   │   │   ├── ConfirmationDialog.tsx        ← Destructive action confirmation
│   │   │   ├── BulkActionBar.tsx             ← Bulk operations toolbar
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── shared/                               ← Shared design system (co-owned)
│       └── ui/
│
├── services/
│   ├── admin-user-service.ts                 ← User CRUD, role changes
│   ├── admin-rule-service.ts                 ← Rule CRUD
│   ├── admin-document-service.ts             ← Legal doc upload/manage
│   ├── admin-inspection-service.ts           ← All inspections read access
│   ├── admin-audit-service.ts                ← Audit log queries
│   └── admin-dashboard-service.ts            ← System-wide stats
│
└── types/
    ├── admin.ts                              ← Admin-specific types
    ├── rule.ts                               ← Rule, RuleVersion
    ├── legal-document.ts                     ← LegalDocument, IngestionStatus
    └── audit-log.ts                          ← AuditLogEntry
```

---

## 3. Admin Pages — Functional Requirements

### 3.1 Admin Dashboard — `/admin/dashboard`

| ID | Requirement |
|---|---|
| ADASH-01 | System-wide stats: total inspections, total users, active rules, compliance rate |
| ADASH-02 | Inspection trend chart (daily/weekly/monthly) |
| ADASH-03 | Violation heatmap by category (MRP, Net Qty, Contact, etc.) |
| ADASH-04 | Top 5 most common violations table |
| ADASH-05 | Inspector activity table (inspections per inspector) |
| ADASH-06 | Pending reviews count with link |
| ADASH-07 | Recent system activity feed |
| ADASH-08 | Date range selector for all charts |
| ADASH-09 | Loading skeletons for all data sections |

### 3.2 User Management — `/admin/users`

| ID | Requirement |
|---|---|
| USR-01 | DataTable: name, email, role, status, last active, inspections count |
| USR-02 | Search by name or email |
| USR-03 | Filter by role (inspector / admin / supervisor) |
| USR-04 | Filter by status (active / inactive) |
| USR-05 | Sort by name, role, last active, inspections count |
| USR-06 | Pagination |
| USR-07 | Click row → `/admin/users/[id]` detail page |
| USR-08 | Invite new inspector button → InviteUserDialog (sends email invite) |
| USR-09 | Bulk actions: activate / deactivate selected users |

### 3.3 User Detail — `/admin/users/[id]`

| ID | Requirement |
|---|---|
| USRD-01 | User profile information (name, email, role, created, last active) |
| USRD-02 | Change user role dropdown |
| USRD-03 | Activate / deactivate toggle |
| USRD-04 | User's inspection history (last 10 inspections) |
| USRD-05 | User's activity statistics |
| USRD-06 | Confirmation dialog for role changes |
| USRD-07 | Cannot deactivate own account |

### 3.4 Rule Management — `/admin/rules`

| ID | Requirement |
|---|---|
| RULE-01 | DataTable: rule code, field, category, severity, status, legal ref, version |
| RULE-02 | Search by rule code, field name, or legal reference |
| RULE-03 | Filter by category (mandatory_declaration, format, placement, etc.) |
| RULE-04 | Filter by severity (LOW / MEDIUM / HIGH / CRITICAL) |
| RULE-05 | Filter by status (active / inactive / draft) |
| RULE-06 | Sort by rule code, severity, effective date |
| RULE-07 | "Create Rule" button → `/admin/rules/new` |
| RULE-08 | Click row → `/admin/rules/[id]` edit page |
| RULE-09 | Pagination |

### 3.5 Create / Edit Rule — `/admin/rules/new`, `/admin/rules/[id]`

| ID | Requirement |
|---|---|
| RULEF-01 | Form fields: rule code, field, category, severity, condition, validation logic |
| RULEF-02 | Form fields: legal reference, description, effective from, effective until |
| RULEF-03 | Form fields: applicable package types (multiselect), applicable categories |
| RULEF-04 | Form fields: exemptions (textarea/list) |
| RULEF-05 | Form fields: required (boolean toggle), is active (boolean toggle) |
| RULEF-06 | Zod validation on all fields |
| RULEF-07 | Preview mode: show how the rule would evaluate |
| RULEF-08 | Save as draft or publish |
| RULEF-09 | Version history sidebar (for edit) |
| RULEF-10 | Delete rule with confirmation dialog (edit only) |
| RULEF-11 | Prevent editing published rules — create new version instead |

### 3.6 Legal Documents — `/admin/legal-documents`

| ID | Requirement |
|---|---|
| DOC-01 | DataTable: document title, type, status, chunks count, uploaded date |
| DOC-02 | Status: Processing / Ready / Failed |
| DOC-03 | "Upload Document" button → `/admin/legal-documents/upload` |
| DOC-04 | Click row → detail card (metadata, chunk preview) |
| DOC-05 | Delete document with confirmation |
| DOC-06 | Re-process failed documents |

### 3.7 Upload Legal Document — `/admin/legal-documents/upload`

| ID | Requirement |
|---|---|
| DOCU-01 | PDF file upload (drag-drop or file picker) |
| DOCU-02 | Metadata form: title, document type, effective date, version |
| DOCU-03 | File size limit: 50MB |
| DOCU-04 | Upload progress indicator |
| DOCU-05 | On success: redirect to document list, show ingestion status |
| DOCU-06 | Error handling: invalid file type, size exceeded |

### 3.8 All Inspections — `/admin/inspections`

| ID | Requirement |
|---|---|
| AINSP-01 | DataTable of ALL inspections across all inspectors |
| AINSP-02 | Columns: ID, Product, Inspector, Status, Score, Date |
| AINSP-03 | Filter by inspector, status, date range |
| AINSP-04 | Search by inspection ID or product name |
| AINSP-05 | Sort by date, score, status |
| AINSP-06 | Click row → `/admin/inspections/[id]` (read-only detail view) |
| AINSP-07 | Export filtered results (CSV) |

### 3.9 Audit Logs — `/admin/audit-logs`

| ID | Requirement |
|---|---|
| AUD-01 | DataTable: timestamp, user, action, entity type, entity ID, IP |
| AUD-02 | Filter by user |
| AUD-03 | Filter by action type (login, inspection_created, rule_updated, etc.) |
| AUD-04 | Filter by entity type (inspection, rule, user, document) |
| AUD-05 | Filter by date range |
| AUD-06 | Click row → detail dialog with full JSON details |
| AUD-07 | Read-only — no edit/delete of audit logs |
| AUD-08 | Pagination (50 per page) |

### 3.10 Settings — `/admin/settings`

| ID | Requirement |
|---|---|
| SET-01 | Confidence threshold configuration (OCR, extraction, overall) |
| SET-02 | System-wide default settings |
| SET-03 | Save with confirmation |

---

## 4. Admin Shell Layout

```tsx
// components/admin/layout/AdminShell.tsx

<div className="flex h-screen">
  <AdminSidebar />              {/* Fixed left sidebar (admin-branded) */}
  <div className="flex-1 flex flex-col">
    <AdminHeader />             {/* Top bar: admin badge, breadcrumb, user menu */}
    <main className="flex-1 overflow-auto p-6 bg-muted/30">
      {children}
    </main>
  </div>
</div>
```

### Admin Sidebar Navigation

```
📊 Dashboard           → /admin/dashboard
👥 Users               → /admin/users
⚖️ Rules               → /admin/rules
📚 Legal Documents     → /admin/legal-documents
📋 All Inspections     → /admin/inspections
📝 Audit Logs          → /admin/audit-logs
⚙️ Settings            → /admin/settings
🚪 Logout              → signOut()
```

---

## 5. Admin Auth Notes

> **Admin accounts are created via Next.js CLI scripts. No admin registration page exists.**

### Admin Creation Flow

```
1. Run: npx ts-node scripts/create-admin.ts
2. Script prompts for: name, email, password
3. Script creates user in DB with role: "admin"
4. Admin logs in via shared /login page
5. Auth middleware detects role="admin" and allows access to (admin)/ routes
```

### Route Protection

```tsx
// app/(admin)/layout.tsx
export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  
  if (!session) redirect('/login');
  if (session.user.role !== 'admin' && session.user.role !== 'supervisor') {
    redirect('/dashboard');  // Non-admins go to inspector dashboard
  }
  
  return <AdminShell>{children}</AdminShell>;
}
```

---

## 6. Admin Design Principles

| Principle | Implementation |
|---|---|
| Dense data | Use compact tables, smaller font sizes, more data per row |
| Searchable | Every table has search functionality |
| Filterable | Multi-filter support on all list pages |
| Bulk operations | Checkbox selection + bulk action toolbar |
| Confirmations | Destructive actions require confirmation dialogs |
| Audit awareness | Show who/when for all modifications |
| Version awareness | Rules show version history, legal docs show processing status |
| Read-only where needed | Admin can view inspections but cannot modify inspector decisions |

---

## 7. API Integration Points

| Page | API Calls |
|---|---|
| Dashboard | `GET /api/v1/admin/dashboard` |
| Users | `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/[id]` |
| User Detail | `GET /api/v1/admin/users/[id]` |
| Rules | `GET /api/v1/admin/rules`, `POST`, `PATCH`, `DELETE` |
| Legal Docs | `GET /api/v1/admin/legal-documents`, `POST` (upload), `DELETE` |
| All Inspections | `GET /api/v1/admin/inspections` |
| Audit Logs | `GET /api/v1/admin/audit-logs` |
| Settings | `GET /api/v1/admin/settings`, `PATCH` |

---

## 8. Ownership Rules

| Rule | Detail |
|---|---|
| FE-3 owns | `(admin)/`, `components/admin/`, admin services, admin types |
| FE-3 co-owns | `components/shared/` (design system primitives) |
| FE-3 must NOT | Import from `components/landing/` or `components/inspector/` |
| FE-3 must NOT | Create auth or registration pages (FE-2 handles auth) |
| FE-3 must NOT | Create inspector-specific scan/review pages |
| Branch pattern | `feature/admin-*` (e.g., `feature/admin-users`, `feature/admin-rules`) |
