import React from "react";
import type { Metadata } from "next";
import { CatalogStockManager } from "@/components/admin/CatalogStockManager";

export const metadata: Metadata = {
  title: "Catalogo & Stock IT/CN",
  robots: { index: false, follow: false },
};

export default function AdminCatalogPage() {
  return <CatalogStockManager />;
}
