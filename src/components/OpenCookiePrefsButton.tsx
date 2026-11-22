"use client";

import React from "react";
import { Cookie } from "lucide-react";
import { useConsent } from "@/context/ConsentContext";

export function OpenCookiePrefsButton() {
  const { openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#0052FF] px-5 text-sm font-bold text-white transition-colors hover:bg-[#003ECC]"
    >
      <Cookie className="h-4 w-4" aria-hidden="true" />
      Apri pannello preferenze cookie
    </button>
  );
}
