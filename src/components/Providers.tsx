"use client";

import React from "react";
import { MotionConfig } from "framer-motion";
import { ConsentProvider } from "@/context/ConsentContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogFilterProvider } from "@/context/CatalogFilterContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ConsentProvider>
        <CatalogFilterProvider>
          <CartProvider>{children}</CartProvider>
        </CatalogFilterProvider>
      </ConsentProvider>
    </MotionConfig>
  );
}
