import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return <AdminShell adminEmail={session.email}>{children}</AdminShell>;
}
