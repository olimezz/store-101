# STORE 101 — E-Commerce Pneumatici con Checkout Stripe

Applicazione web full-stack per **STORE 101** sviluppata con **Next.js 15 (App Router)**, **TypeScript strict**, **Tailwind CSS**, **Radix UI**, **Framer Motion**, **Zod** e **Stripe Checkout + Webhook**.

## Funzionalità Principali

- **Design System ad Alta Conversione**: Palette vibrante (`#F8FAFC`, `#FFFFFF`, `#0052FF`, `#FF5A1F`, accenti semantici stagionali Estivi/Invernali/4 Stagioni), tipografia fluida `clamp()` (`Plus Jakarta Sans` + `Inter` con `tabular-nums`), touch target `>= 44x44px`.
- **Configuratore Rapido Misure**: Selettori a cascata `Larghezza / Altezza / Diametro / Stagione / Brand` con filtraggio istantaneo e assistenza tecnica misure con protezione anti-spam.
- **Catalogo 12 Prodotti Reali**: Badge numerati, etichetta energetica UE (Consumi, Bagnato, dB), selettore rapido `1 / 2 / 4 gomme` con sconto automatico `-5%` sul treno completo e feedback animato `"Aggiunto ✓"`.
- **Carrello Persistente + Stripe Server-Side**:
  - Calcolo in tempo reale di subtotale, sconto `-5%` su 4 gomme, codici promo (`BENVENUTO15`, `STORE101`), **contributo ambientale PFU obbligatorio (€3,50/pneumatico)** e spedizione gratuita sopra €150.
  - `POST /api/checkout`: ricalcola tutti i prezzi esclusivamente lato server dal catalogo `src/data/products.ts` (zero fiducia ai prezzi client), applica rate limiting IP e crea una Stripe Checkout Session.
  - `POST /api/webhooks/stripe`: verifica firma crittografica `stripe.webhooks.constructEvent` su `checkout.session.completed` e aggiorna lo stato ordine.
- **Security by Design & GDPR**:
  - HTTP Security Headers in `next.config.ts` (CSP compatibile Stripe, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `HSTS`).
  - Validazione Zod + sanitizzazione XSS + honeypot anti-spam + rate limiting su tutte le API route.
  - Cookie Banner preventivo con 3 pulsanti di pari gerarchia visiva, blocco tecnico reale degli script GA4/Meta Pixel tramite `ConsentContext`, link persistente nel footer `"Gestisci preferenze cookie"`, e pagine legali complete (`/privacy-policy`, `/cookie-policy`, `/termini-e-condizioni`).

## Avvio Locale

1. Copia il file delle variabili d'ambiente:
   ```bash
   cp .env.example .env.local
   ```
2. Inserisci le tue chiavi Stripe Test in `.env.local`:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `STRIPE_SECRET_KEY=sk_test_...` (solo lato server, mai `NEXT_PUBLIC_`)
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
3. Installa le dipendenze e avvia il server di sviluppo:
   ```bash
   npm install
   npm run dev
   ```
4. (Opzionale) Inoltra i webhook Stripe in locale con Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Codici Promo Inclusi per Test

- `BENVENUTO15` — €15,00 di sconto su ordini >= €150,00 (sbloccabile anche dal form newsletter)
- `STORE101` — 5% di sconto extra sul carrello
