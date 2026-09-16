import { AdminUser, UserRole, UserStatus } from "@/types/admin";

let MOCK_USERS: AdminUser[] = [
  {
    id: "usr-01",
    name: "Dhruv Patel",
    email: "admin@validra.gov.in",
    role: "admin",
    status: "active",
    createdAt: "2026-01-10",
    lastActive: "Just now",
    inspectionsCount: 142,
    jurisdiction: "National Oversight",
  },
  {
    id: "usr-02",
    name: "Rajesh Sharma",
    email: "rajesh.sharma@lm.gov.in",
    role: "inspector",
    status: "active",
    createdAt: "2026-02-15",
    lastActive: "15 mins ago",
    inspectionsCount: 342,
    jurisdiction: "Delhi NCR - Zone A",
  },
  {
    id: "usr-03",
    name: "Sunita Deshmukh",
    email: "sunita.deshmukh@lm.gov.in",
    role: "inspector",
    status: "active",
    createdAt: "2026-03-01",
    lastActive: "1 hour ago",
    inspectionsCount: 298,
    jurisdiction: "Maharashtra - Mumbai Metro",
  },
  {
    id: "usr-04",
    name: "Amitabh Verma",
    email: "amitabh.verma@lm.gov.in",
    role: "supervisor",
    status: "active",
    createdAt: "2026-01-22",
    lastActive: "3 hours ago",
    inspectionsCount: 245,
    jurisdiction: "Uttar Pradesh - West",
  },
  {
    id: "usr-05",
    name: "Kavita Nair",
    email: "kavita.nair@lm.gov.in",
    role: "inspector",
    status: "inactive",
    createdAt: "2026-03-12",
    lastActive: "5 days ago",
    inspectionsCount: 189,
    jurisdiction: "Kerala - South Zone",
  },
  {
    id: "usr-06",
    name: "Manoj Chawla",
    email: "manoj.chawla@lm.gov.in",
    role: "inspector",
    status: "invited",
    createdAt: "2026-09-14",
    lastActive: "Never",
    inspectionsCount: 0,
    jurisdiction: "Punjab - Ludhiana",
  },
];

export async function getAdminUsers(): Promise<AdminUser[]> {
  return [...MOCK_USERS];
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const user = MOCK_USERS.find((u) => u.id === id);
  return user ? { ...user } : null;
}

export async function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  const index = MOCK_USERS.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found");
  MOCK_USERS[index] = { ...MOCK_USERS[index], role };
  return { ...MOCK_USERS[index] };
}

export async function toggleUserStatus(id: string, status: UserStatus): Promise<AdminUser> {
  const index = MOCK_USERS.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found");
  MOCK_USERS[index] = { ...MOCK_USERS[index], status };
  return { ...MOCK_USERS[index] };
}

export async function inviteInspector(data: {
  name: string;
  email: string;
  jurisdiction: string;
  role: UserRole;
}): Promise<AdminUser> {
  const newUser: AdminUser = {
    id: `usr-0${MOCK_USERS.length + 1}`,
    name: data.name,
    email: data.email,
    jurisdiction: data.jurisdiction,
    role: data.role,
    status: "invited",
    createdAt: new Date().toISOString().split("T")[0],
    lastActive: "Invited",
    inspectionsCount: 0,
  };
  MOCK_USERS = [newUser, ...MOCK_USERS];
  return { ...newUser };
}

export async function bulkUpdateUserStatus(ids: string[], status: UserStatus): Promise<void> {
  MOCK_USERS = MOCK_USERS.map((u) => (ids.includes(u.id) ? { ...u, status } : u));
}
