"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@store101.it");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Credenziali non valide.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Errore di connessione al server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(60% 60% at 80% 15%, rgba(0, 82, 255, 0.28) 0%, rgba(15, 23, 42, 0) 70%), linear-gradient(145deg, #0F172A 0%, #111C38 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-display text-2xl font-extrabold tracking-tight"
          >
            <span className="text-white">STORE</span>
            <span className="rounded-md bg-[#0052FF] px-2 py-0.5 text-white">
              101
            </span>
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Area Riservata Gestionale &bull; CRM &bull; Sync CSV
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0052FF]/10 text-[#0052FF]">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-[#0F172A]">
                Accesso Amministratore
              </h1>
              <p className="text-xs text-[#475569]">
                Sessione protetta RBAC con rate limiting anti brute-force
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#475569]"
              >
                Email Admin
              </label>
              <div className="relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[48px] w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 text-sm font-medium text-[#0F172A] focus:border-[#0052FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#475569]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci la password amministratore"
                  className="min-h-[48px] w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 text-sm font-medium text-[#0F172A] focus:border-[#0052FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
                />
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition-colors hover:bg-[#003ECC] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifica in corso...
                </>
              ) : (
                "Accedi alla Dashboard"
              )}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-[11px] leading-relaxed text-[#475569]">
            <p className="font-bold text-[#0F172A]">Credenziali predefinite ambiente demo:</p>
            <p className="mt-0.5 font-mono">
              Email: admin@store101.it &bull; Pass: Store101Admin!2026
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Personalizzabili via variabili <code>ADMIN_EMAIL</code> e{" "}
              <code>ADMIN_PASSWORD</code> su Vercel / <code>.env.local</code>.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Torna allo Storefront pubblico
          </Link>
        </div>
      </div>
    </div>
  );
}
