import React from "react";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0052FF]/10 text-[#0052FF]">
        <SearchX className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#0F172A]">
        Pagina non trovata
      </h1>
      <p className="mt-2 text-sm text-[#475569]">
        La pagina o la misura di pneumatico richiesta non è disponibile. Torna
        al catalogo principale per trovare la gomma giusta per il tuo veicolo.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#0052FF] px-6 text-sm font-bold text-white hover:bg-[#003ECC]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Torna a STORE 101
      </Link>
    </div>
  );
}
