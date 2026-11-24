# STORE 101 — E-Commerce Pneumatici con Checkout Stripe

Applicazione web full-stack per **STORE 101** sviluppata con **Next.js 15 (App Router)**, **TypeScript strict**, **Tailwind CSS**, **Radix UI**, **Framer Motion**, **Zod** e **Stripe Checkout + Webhook**.

## Funzionalità Principali

### Storefront E-Commerce
- **Design System ad Alta Conversione**: Palette vibrante (`#F8FAFC`, `#FFFFFF`, `#0052FF`, `#FF5A1F`, accenti semantici stagionali Estivi/Invernali/4 Stagioni), tipografia fluida `clamp()` (`Plus Jakarta Sans` + `Inter` con `tabular-nums`), touch target `>= 44x44px`.
- **Logistica Dual-Source (Italia vs Cina + Split Order)**: Mostra automaticamente *"Disponibile in Italia — 4-7 gg lav."* quando `stock_italia > 0`, *"Su ordinazione — 5-15 gg lav."* quando `stock_italia == 0 && stock_cina > 0`, e gestione **Split Order** nel carrello (spedizione separata vs unica consolidata).
- **Configuratore Rapido Misure**: Selettori a cascata `Larghezza / Altezza / Diametro / Stagione / Brand` con filtraggio istantaneo e tracking anonimo delle misure più cercate.

### Area Gestionale Admin (`/admin`), CRM & Sync Serale CSV
- **Accesso Protetto RBAC (`/admin/login`)**: Autenticazione `ADMIN` lato server con cookie firmato `HttpOnly`, protezione anti brute-force e audit log degli accessi. Credenziali demo: `admin@store101.it` / `Store101Admin!2026` (configurabili via `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- **Sincronizzazione Serale CSV (`/admin/import-csv`)**: Drag & drop con limite 10MB, verifica MIME, protezione anti **CSV Formula Injection**, validazione Zod riga per riga, **anteprima dry-run con diff** (`Vecchio → Nuovo Stock IT/CN`, vendite rilevate, errori riga), template scaricabile e **rollback 1-clic** alla versione precedente.
- **Analytics Privacy-First & KPI (`/admin`)**: Fatturato, margine stimato, gomme vendute split IT/CN, visite cookieless con hash giornaliero anonimo, tasso di conversione, grafico Recharts combinato, misure cercate con alert 0-stock IT.
- **Ordini & Logistica (`/admin/ordini`)**: Filtri per origine (`Italia`, `Cina`, `Split`), pipeline stati ordine, inserimento corriere + tracking con notifica email transazionale e link WhatsApp 1-clic.
- **CRM Clienti & GDPR Art. 17 (`/admin/crm`)**: Scheda cliente con veicolo/targa/misura/LTV/note, bottone WhatsApp precompilato, timestamp consenso privacy, **Export JSON/CSV** e **Anonimizzazione Art. 17 GDPR** che conserva i dati fiscali degli ordini per 10 anni.
- **Schema PostgreSQL / Supabase RLS**: Pronto in `supabase/schema.sql`.
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
