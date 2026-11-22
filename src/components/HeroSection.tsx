"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, SlidersHorizontal, Zap } from "lucide-react";

export function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Solo proprietà GPU-accelerated (transform)
  const tireY = useTransform(scrollYProgress, [0, 1], [0, 42]);
  const tireScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-[#0F172A] pb-20 pt-10 text-white sm:pb-28 sm:pt-14 lg:pb-32 lg:pt-16"
    >
      {/* Dynamic Metallic Anthracite + Electric Blue + Silver Ambient Gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 75% at 78% 42%, rgba(29, 78, 216, 0.58) 0%, rgba(15, 23, 42, 0.1) 58%, rgba(15, 23, 42, 1) 100%), radial-gradient(35% 40% at 88% 18%, rgba(226, 232, 240, 0.24) 0%, rgba(15, 23, 42, 0) 70%), linear-gradient(125deg, #0F172A 0%, #111C38 52%, #1D4ED8 100%)",
        }}
      />

      {/* Subtle architectural tech grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        {/* Left Content Column */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="lg:col-span-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-[#FF5A1F]" aria-hidden="true" />
            <span>Nuova Collezione 2026</span>
            <span className="rounded-full bg-[#FF5A1F] px-2 py-0.5 text-[10px] font-extrabold text-white">
              -5% SU 4 GOMME
            </span>
          </div>

          <h1
            className="mt-5 font-display font-extrabold uppercase leading-[1.06] tracking-[-0.025em] text-white"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
          >
            Performance e sicurezza{" "}
            <span className="bg-gradient-to-r from-[#60A5FA] via-[#E2E8F0] to-white bg-clip-text text-transparent">
              senza compromessi
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Scopri pneumatici premium delle migliori marche. Progettati per
            massima aderenza, durata chilometrica e controllo totale su ogni
            strada.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => scrollTo("catalogo")}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-7 text-sm font-bold uppercase tracking-wide text-white shadow-[0_12px_28px_-6px_rgba(0,82,255,0.55)] transition-colors hover:bg-[#003ECC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Acquista Ora</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollTo("configuratore-misure")}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#FF5A1F]" aria-hidden="true" />
              <span>Trova la tua Gomma</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-medium text-slate-300 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
              DOT recente garantito (&lt; 12 mesi)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
              Checkout sicuro Stripe
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
              Consegna Express 24/48h
            </span>
          </div>
        </motion.div>

        {/* Right Visual Column: 3D HD Tire Render with Scroll Parallax */}
        <div className="relative lg:col-span-6">
          <motion.div
            style={{ y: tireY, scale: tireScale }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative mx-auto max-w-xl will-change-transform lg:max-w-none"
          >
            {/* Electric-blue & metallic silver rim aura */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#0052FF]/35 via-[#E2E8F0]/15 to-[#FF5A1F]/20 blur-2xl"
            />

            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0F172A]/80 shadow-2xl">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/images/hero-tire.jpg"
                  alt="Pneumatico sportivo ad alte prestazioni STORE 101"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                {/* Soft bottom vignette for badge legibility */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-transparent to-transparent"
                />
              </div>

              {/* Floating performance telemetry strip */}
              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-[#0F172A]/90 px-4 py-3 text-center backdrop-blur-md">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Bagnato UE
                  </p>
                  <p className="mt-0.5 font-display text-sm font-extrabold tabular-nums text-white sm:text-base">
                    Classe A
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Officine Italia
                  </p>
                  <p className="mt-0.5 font-display text-sm font-extrabold tabular-nums text-white sm:text-base">
                    1.200+
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Sconto Treno 4
                  </p>
                  <p className="mt-0.5 font-display text-sm font-extrabold tabular-nums text-[#FF5A1F] sm:text-base">
                    -5% Auto
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
