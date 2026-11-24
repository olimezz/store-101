"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tracciamento visite cookieless GDPR-compliant lato server:
 * nessun cookie impostato, nessun dato personale inviato.
 */
export function CookielessTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pageview" }),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
