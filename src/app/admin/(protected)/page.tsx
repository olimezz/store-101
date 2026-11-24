import React from "react";
import type { Metadata } from "next";
import { OverviewDashboard } from "@/components/admin/OverviewDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard & Analytics",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return <OverviewDashboard />;
}
