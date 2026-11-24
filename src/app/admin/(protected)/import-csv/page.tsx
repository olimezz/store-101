import React from "react";
import type { Metadata } from "next";
import { CsvImportConsole } from "@/components/admin/CsvImportConsole";

export const metadata: Metadata = {
  title: "Importa CSV",
  robots: { index: false, follow: false },
};

export default function AdminImportCsvPage() {
  return <CsvImportConsole />;
}
