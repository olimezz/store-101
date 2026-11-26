"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BarChart3,
  ExternalLink,
  FileSpreadsheet,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Panoramica & Analytics",
    mobileLabel: "KPI",
    icon: BarChart3,
    inBottomNav: true,
  },
  {
    href: "/admin/import-csv",
    label: "Importa CSV",
    mobileLabel: "Upload CSV",
    icon: FileSpreadsheet,
    inBottomNav: true,
  },
  {
    href: "/admin/catalogo",
    label: "Catalogo & Stock (IT/CN)",
    mobileLabel: "Stock IT/CN",
    icon: Package,
    inBottomNav: true,
  },
  {
    href: "/admin/ordini",
    label: "Ordini & Logistica",
    mobileLabel: "Ordini",
    icon: ShoppingBag,
    inBottomNav: true,
  },
  {
    href: "/admin/crm",
    label: "CRM Clienti",
    mobileLabel: "Clienti",
    icon: Users,
    inBottomNav: true,
  },
  {
    href: "/admin/impostazioni",
    label: "Impostazioni & Audit",
    mobileLabel: "Impostazioni",
    icon: Settings,
    inBottomNav: false,
  },
];

export function AdminShell({
  adminEmail,
  children,
}: {
  adminEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const sidebarLinks = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight"
        >
          <span className="text-white">STORE</span>
          <span className="rounded-md bg-[#0052FF] px-1.5 py-0.5 text-white">
            101
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            ADMIN
          </span>
        </Link>
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Chiudi menu"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navigazione gestionale">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-[46px] items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-2">
        <div className="rounded-xl bg-white/5 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ruolo RBAC: ADMIN
          </p>
          <p className="truncate text-xs font-semibold text-white">
            {adminEmail}
          </p>
        </div>

        <Link
          href="/"
          className="flex min-h-[44px] items-center justify-between rounded-xl px-3 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span>Apri Storefront Pubblico</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Esci dalla Dashboard</span>
        </button>
      </div>
    </div>
  );

  const bottomNavItems = NAV_ITEMS.filter((i) => i.inBottomNav);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Fixed Sidebar (260px) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] bg-[#0F172A] lg:block">
        {sidebarLinks()}
      </aside>

      {/* Mobile Top Bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-[#0F172A] px-4 text-white lg:hidden">
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label="Apri menu admin"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-white hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm lg:hidden" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[280px] bg-[#0F172A] shadow-2xl focus:outline-none lg:hidden">
              <Dialog.Title className="sr-only">Menu Gestionale STORE 101</Dialog.Title>
              {sidebarLinks(() => setDrawerOpen(false))}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Link
          href="/admin"
          className="flex items-center gap-1.5 font-display text-lg font-extrabold"
        >
          <span>STORE</span>
          <span className="rounded bg-[#0052FF] px-1.5 py-0.5 text-sm">101</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            Admin
          </span>
        </Link>

        <Link
          href="/admin/import-csv"
          className="inline-flex min-h-[44px] items-center rounded-xl bg-[#FF5A1F] px-3 text-xs font-extrabold text-white"
        >
          + CSV
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pt-16 pb-20 lg:pl-[260px] lg:pt-0 lg:pb-0">
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (5 quick tabs, >= 44x44px touch targets) */}
      <nav
        aria-label="Navigazione rapida mobile"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md lg:hidden"
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[58px] flex-col items-center justify-center gap-1 px-0.5 text-center text-[10px] sm:text-[11px] font-bold transition-colors",
                active ? "text-[#0052FF]" : "text-[#475569]"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-full">{item.mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
