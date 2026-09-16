import type { Metadata } from "next";
import { AdminShell } from "@/components/admin";

export const metadata: Metadata = {
  title: {
    template: "%s | Validra Admin Supervisory Portal",
    default: "Validra Admin Supervisory Portal — Legal Metrology Compliance",
  },
  description:
    "Administrative command center for statutory packaged commodity enforcement, rule engine authoring, and evidence audit trails.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
