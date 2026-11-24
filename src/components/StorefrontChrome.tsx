"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import {
  CookieBanner,
  CookiePreferencesModal,
  ThirdPartyScripts,
} from "@/components/GdprConsent";
import { CookielessTracker } from "@/components/CookielessTracker";

export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CookielessTracker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <CookieBanner />
      <CookiePreferencesModal />
      <ThirdPartyScripts />
    </div>
  );
}
