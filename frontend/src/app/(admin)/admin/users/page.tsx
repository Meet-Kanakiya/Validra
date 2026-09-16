"use client";

import * as React from "react";
import { AdminUser, UserStatus } from "@/types/admin";
import {
  getAdminUsers,
  toggleUserStatus,
  bulkUpdateUserStatus,
} from "@/services/admin-user-service";
import {
  AdminPageHeader,
  UserFilters,
  UserTable,
  InviteUserDialog,
  AdminEmptyState,
} from "@/components/admin";
import { Button } from "@/components/shared";
import { UserPlus, Users } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const refreshUsers = () => {
    getAdminUsers().then(setUsers);
  };

  React.useEffect(() => {
    getAdminUsers().then(setUsers);
  }, []);

  const handleStatusToggle = async (id: string, newStatus: UserStatus) => {
    await toggleUserStatus(id, newStatus);
    refreshUsers();
  };

  const handleBulkStatusUpdate = async (ids: string[], newStatus: UserStatus) => {
    await bulkUpdateUserStatus(ids, newStatus);
    refreshUsers();
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.jurisdiction && u.jurisdiction.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Officer & User Management"
        subtitle="Manage field inspector credentials, supervisory assignments, and role-based permissions"
        badge={`${users.length} Officers`}
      >
        <Button
          size="sm"
          onClick={() => setIsInviteOpen(true)}
          className="bg-green-700 hover:bg-green-800 text-white font-medium gap-1.5 shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Officer</span>
        </Button>
      </AdminPageHeader>

      <UserFilters
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {filteredUsers.length > 0 ? (
        <UserTable
          users={filteredUsers}
          onStatusToggle={handleStatusToggle}
          onBulkStatusUpdate={handleBulkStatusUpdate}
        />
      ) : (
        <AdminEmptyState
          icon={Users}
          title="No Officers Found"
          description="No users matched your search and filter criteria. Adjust the filters or invite a new inspector."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setRoleFilter("ALL");
            setStatusFilter("ALL");
          }}
        />
      )}

      <InviteUserDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onUserInvited={refreshUsers}
      />
    </div>
  );
}
