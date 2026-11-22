"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import {
  Check,
  Menu,
  Search,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  useCatalogFilter,
  type CategoryNavKey,
} from "@/context/CatalogFilterContext";
import { cn } from "@/lib/utils";

const NAV_CATEGORIES: {
  key: CategoryNavKey;
  label: string;
  activeColor: string;
  indicatorColor: string;
}[] = [
  {
    key: "estivi",
    label: "Estivi",
    activeColor: "text-[#B45309]",
    indicatorColor: "bg-[#F59E0B]",
  },
  {
    key: "invernali",
    label: "Invernali",
    activeColor: "text-[#0369A1]",
    indicatorColor: "bg-[#0EA5E9]",
  },
  {
    key: "4-stagioni",
    label: "4 Stagioni",
    activeColor: "text-[#047857]",
    indicatorColor: "bg-[#10B981]",
  },
  {
    key: "auto",
    label: "Auto",
    activeColor: "text-[#0052FF]",
    indicatorColor: "bg-[#0052FF]",
  },
  {
    key: "suv-furgo",
    label: "SUV & Furgo",
    activeColor: "text-[#0052FF]",
    indicatorColor: "bg-[#0052FF]",
  },
  {
    key: "accessori",
    label: "Accessori",
    activeColor: "text-[#FF5A1F]",
    indicatorColor: "bg-[#FF5A1F]",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { order, openCart } = useCart();
  const { filters, setCategoryNav, setFilter, resetFilters } = useCatalogFilter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<"login" | "register">("login");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPrivacy, setAccountPrivacy] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState<string | null>(null);

  const handleCategoryClick = (key: CategoryNavKey) => {
    if (filters.category === key) {
      setCategoryNav("tutti");
    } else {
      setCategoryNav(key);
    }
    setMobileMenuOpen(false);

    if (pathname !== "/") {
      router.push("/#catalogo");
    } else {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileSearchOpen(false);
    if (pathname !== "/") {
      router.push("/#catalogo");
    } else {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountEmail.includes("@")) {
      setAccountFeedback("Inserisci un indirizzo email valido.");
      return;
    }
    if (accountTab === "register" && !accountPrivacy) {
      setAccountFeedback(
        "Devi accettare la Privacy Policy e i Termini per creare un account."
      );
      return;
    }
    setAccountFeedback(
      accountTab === "login"
        ? "Link di accesso sicuro inviato alla tua email."
        : "Registrazione completata! Controlla la tua casella per attivare l'account STORE 101."
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md">
      {/* Top Bar Promozionale (#FF5A1F) */}
      <div className="bg-[#FF5A1F] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold tracking-tight sm:text-sm">
          <Truck className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
          <span>
            Spedizione Gratuita su ordini oltre €150 &bull; Montaggio presso
            oltre 1.200 officine partner o consegna a casa tua
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="border-b border-[#E2E8F0]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          {/* Left: Hamburger (Mobile) + Brand Logo */}
          <div className="flex items-center gap-2">
            <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  aria-label="Apri menu navigazione"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#0F172A] transition-colors hover:bg-slate-100 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm lg:hidden" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col bg-white p-5 shadow-2xl focus:outline-none lg:hidden">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                    <Dialog.Title className="font-display text-xl font-extrabold tracking-tight">
                      <span className="text-[#0F172A]">STORE</span>{" "}
                      <span className="text-[#0052FF]">101</span>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Chiudi menu"
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#475569] hover:bg-slate-100"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <nav className="mt-4 flex flex-col gap-1" aria-label="Categorie mobili">
                    <button
                      type="button"
                      onClick={() => handleCategoryClick("tutti")}
                      className={cn(
                        "flex min-h-[44px] items-center justify-between rounded-xl px-3.5 text-left text-sm font-semibold transition-colors",
                        filters.category === "tutti"
                          ? "bg-[#0052FF]/10 text-[#0052FF]"
                          : "text-[#0F172A] hover:bg-slate-100"
                      )}
                    >
                      <span>Tutto il Catalogo</span>
                    </button>
                    {NAV_CATEGORIES.map((cat) => {
                      const active = filters.category === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => handleCategoryClick(cat.key)}
                          className={cn(
                            "flex min-h-[44px] items-center justify-between rounded-xl px-3.5 text-left text-sm font-semibold transition-colors",
                            active
                              ? "bg-slate-100 text-[#0F172A]"
                              : "text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]"
                          )}
                        >
                          <span className={active ? cat.activeColor : undefined}>
                            {cat.label}
                          </span>
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              cat.indicatorColor,
                              active ? "opacity-100" : "opacity-35"
                            )}
                          />
                        </button>
                      );
                    })}
                  </nav>

                  <div className="mt-auto space-y-2 border-t border-[#E2E8F0] pt-4 text-xs text-[#475569]">
                    <Link
                      href="/termini-e-condizioni"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] items-center rounded-lg px-2 font-medium hover:bg-slate-100 hover:text-[#0F172A]"
                    >
                      Termini, Recesso 14gg & PFU
                    </Link>
                    <Link
                      href="/privacy-policy"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] items-center rounded-lg px-2 font-medium hover:bg-slate-100 hover:text-[#0F172A]"
                    >
                      Privacy & Cookie Policy
                    </Link>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <Link
              href="/"
              onClick={() => resetFilters()}
              className="flex min-h-[44px] items-center gap-1.5 font-display text-xl font-extrabold tracking-[-0.03em] sm:text-2xl"
              aria-label="STORE 101 Home"
            >
              <span className="text-[#0F172A]">STORE</span>
              <span className="rounded-md bg-[#0052FF]/10 px-1.5 py-0.5 text-[#0052FF]">
                101
              </span>
            </Link>
          </div>

          {/* Center: Desktop Categories */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Categorie principali"
          >
            {NAV_CATEGORIES.map((cat) => {
              const active = filters.category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryClick(cat.key)}
                  className={cn(
                    "relative flex min-h-[44px] items-center px-3 text-sm font-semibold transition-colors",
                    active
                      ? cat.activeColor
                      : "text-[#475569] hover:text-[#0F172A]"
                  )}
                >
                  {cat.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-[3px] rounded-full transition-opacity",
                      cat.indicatorColor,
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right: Search + Account + Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Desktop instant search */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden md:block"
              role="search"
            >
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Cerca misura (es. 225/45 R17)"
                aria-label="Cerca pneumatico per misura o marca"
                className="min-h-[44px] w-52 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-3 text-sm text-[#0F172A] placeholder:text-[#475569]/70 transition-colors focus:border-[#0052FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 xl:w-64"
              />
            </form>

            {/* Mobile search toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Apri ricerca pneumatici"
              aria-expanded={mobileSearchOpen}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#0F172A] transition-colors hover:bg-slate-100 md:hidden"
            >
              {mobileSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>

            {/* Account button + Modal */}
            <Dialog.Root
              open={accountOpen}
              onOpenChange={(open) => {
                setAccountOpen(open);
                if (!open) setAccountFeedback(null);
              }}
            >
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  aria-label="Area Account"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#0F172A] transition-colors hover:bg-slate-100"
                >
                  <User className="h-5 w-5" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl focus:outline-none">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                    <Dialog.Title className="font-display text-lg font-bold text-[#0F172A]">
                      Area Clienti STORE 101
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Chiudi finestra account"
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#475569] hover:bg-slate-100"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-[#F8FAFC] p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountTab("login");
                        setAccountFeedback(null);
                      }}
                      className={cn(
                        "min-h-[44px] rounded-lg text-sm font-semibold transition-colors",
                        accountTab === "login"
                          ? "bg-white text-[#0F172A] shadow-sm"
                          : "text-[#475569] hover:text-[#0F172A]"
                      )}
                    >
                      Accedi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountTab("register");
                        setAccountFeedback(null);
                      }}
                      className={cn(
                        "min-h-[44px] rounded-lg text-sm font-semibold transition-colors",
                        accountTab === "register"
                          ? "bg-white text-[#0F172A] shadow-sm"
                          : "text-[#475569] hover:text-[#0F172A]"
                      )}
                    >
                      Registrati
                    </button>
                  </div>

                  <form onSubmit={handleAccountSubmit} className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="account-email"
                        className="block text-xs font-semibold uppercase tracking-wide text-[#475569]"
                      >
                        Email
                      </label>
                      <input
                        id="account-email"
                        type="email"
                        required
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                        placeholder="nome@esempio.it"
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] px-3.5 text-sm text-[#0F172A] focus:border-[#0052FF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
                      />
                    </div>

                    {accountTab === "register" ? (
                      <div className="flex items-start gap-3">
                        <Checkbox.Root
                          id="account-privacy"
                          checked={accountPrivacy}
                          onCheckedChange={(checked) =>
                            setAccountPrivacy(checked === true)
                          }
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#94A3B8] bg-white data-[state=checked]:border-[#0052FF] data-[state=checked]:bg-[#0052FF]"
                        >
                          <Checkbox.Indicator>
                            <Check className="h-3.5 w-3.5 text-white" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label
                          htmlFor="account-privacy"
                          className="text-xs leading-relaxed text-[#475569]"
                        >
                          Accetto la{" "}
                          <Link
                            href="/privacy-policy"
                            onClick={() => setAccountOpen(false)}
                            className="font-semibold text-[#0052FF] underline"
                          >
                            Privacy Policy
                          </Link>{" "}
                          e i{" "}
                          <Link
                            href="/termini-e-condizioni"
                            onClick={() => setAccountOpen(false)}
                            className="font-semibold text-[#0052FF] underline"
                          >
                            Termini di Vendita
                          </Link>
                          .
                        </label>
                      </div>
                    ) : null}

                    {accountFeedback ? (
                      <p className="rounded-xl bg-[#0052FF]/10 p-3 text-xs font-medium text-[#0052FF]">
                        {accountFeedback}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      className="min-h-[44px] w-full rounded-xl bg-[#0052FF] px-4 text-sm font-bold text-white transition-colors hover:bg-[#003ECC]"
                    >
                      {accountTab === "login"
                        ? "Invia link di accesso"
                        : "Crea Account STORE 101"}
                    </button>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {/* Cart button with vibrant #FF5A1F badge */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Apri carrello (${order.totalQuantity} articoli)`}
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-3 text-white transition-colors hover:bg-[#0052FF]"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden text-sm font-semibold sm:inline">
                Carrello
              </span>
              {order.totalQuantity > 0 ? (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#FF5A1F] px-1.5 text-xs font-extrabold tabular-nums text-white shadow-sm">
                  {order.totalQuantity}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Full-width Mobile Instant Search */}
        {mobileSearchOpen ? (
          <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative" role="search">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]"
                aria-hidden="true"
              />
              <input
                type="search"
                autoFocus
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Cerca misura (es. 225/45 R17) o marca..."
                aria-label="Cerca pneumatico"
                className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-20 text-sm text-[#0F172A] focus:border-[#0052FF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0052FF] px-3 py-1.5 text-xs font-bold text-white"
              >
                Cerca
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
