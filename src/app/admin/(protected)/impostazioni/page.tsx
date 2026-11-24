import React from "react";
import type { Metadata } from "next";
import { SettingsAuditView } from "@/components/admin/SettingsAuditView";

export const metadata: Metadata = {
  title: "Impostazioni & Audit Log",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SettingsAuditView />;
}
