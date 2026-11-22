"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ConsentState {
  version: number;
  decided: boolean;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string | null;
}

interface ConsentContextValue {
  consent: ConsentState;
  hydrated: boolean;
  showBanner: boolean;
  preferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: { analytics: boolean; marketing: boolean }) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const STORAGE_KEY = "store101_cookie_consent_v1";
const CONSENT_VERSION = 1;

const DEFAULT_CONSENT: ConsentState = {
  version: CONSENT_VERSION,
  decided: false,
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: null,
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [hydrated, setHydrated] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ConsentState>;
        if (parsed.version === CONSENT_VERSION && typeof parsed.decided === "boolean") {
          setConsent({
            version: CONSENT_VERSION,
            decided: parsed.decided,
            necessary: true,
            analytics: Boolean(parsed.analytics),
            marketing: Boolean(parsed.marketing),
            updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
          });
        }
      }
    } catch {
      // Ignora errori storage in navigazione privata restrittiva
    } finally {
      setHydrated(true);
    }
  }, []);

  const persist = useCallback((next: ConsentState) => {
    setConsent(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Fallback silenzioso se localStorage è disabilitato
    }
  }, []);

  const acceptAll = useCallback(() => {
    persist({
      version: CONSENT_VERSION,
      decided: true,
      necessary: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    });
    setPreferencesOpen(false);
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist({
      version: CONSENT_VERSION,
      decided: true,
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    });
    setPreferencesOpen(false);
  }, [persist]);

  const savePreferences = useCallback(
    (prefs: { analytics: boolean; marketing: boolean }) => {
      persist({
        version: CONSENT_VERSION,
        decided: true,
        necessary: true,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        updatedAt: new Date().toISOString(),
      });
      setPreferencesOpen(false);
    },
    [persist]
  );

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const showBanner = hydrated && !consent.decided && !preferencesOpen;

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hydrated,
      showBanner,
      preferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      consent,
      hydrated,
      showBanner,
      preferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    ]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent deve essere usato dentro ConsentProvider");
  }
  return ctx;
}
