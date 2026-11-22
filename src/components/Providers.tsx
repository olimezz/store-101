"use client";

import React from "react";
import { MotionConfig } from "framer-motion";
import { ConsentProvider } from "@/context/ConsentContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogFilterProvider } from "@/context/CatalogFilterContext";
import { CartDrawer } from "@/components/CartDrawer";
import {
  CookieBanner,
  CookiePreferencesModal,
  ThirdPartyScripts,
} from "@/components/GdprConsent";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ConsentProvider>
        <CartProvider>
          <CatalogFilterProvider>
            {children}
            <CartDrawer />
            <CookieBanner />
            <CookiePreferencesModal />
            <ThirdPartyScripts />
          </CatalogFilterProvider>
        </CartProvider>
      </ConsentProvider>
    </MotionConfig>
  );
}
