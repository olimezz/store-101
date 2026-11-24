import React from "react";
import type { Metadata } from "next";
import { CrmManager } from "@/components/admin/CrmManager";

export const metadata: Metadata = {
  title: "CRM Clienti & GDPR",
  robots: { index: false, follow: false },
};

export default function AdminCrmPage() {
  return <CrmManager />;
}
