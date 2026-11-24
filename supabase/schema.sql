-- =====================================================================
-- STORE 101 — Schema PostgreSQL / Supabase con Row Level Security (RLS)
-- Pronto per deploy su Supabase (Dashboard -> SQL Editor)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profili Admin (RBAC)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Catalogo Prodotti & Giacenze Dual-Source (Italia vs Cina)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  size_label TEXT NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('estivi', 'invernali', '4-stagioni', 'accessori')),
  vehicle TEXT NOT NULL CHECK (vehicle IN ('auto', 'suv-furgo', 'accessori')),
  stock_italia INTEGER NOT NULL DEFAULT 0 CHECK (stock_italia >= 0),
  stock_cina INTEGER NOT NULL DEFAULT 0 CHECK (stock_cina >= 0),
  price_eur NUMERIC(10, 2) NOT NULL CHECK (price_eur > 0),
  cost_eur NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (cost_eur >= 0),
  is_tire BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_size ON public.products(size_label);

-- 3. CRM Clienti (con tracciamento consenso GDPR e supporto Art. 17)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  vehicle_model TEXT,
  license_plate TEXT,
  tire_size TEXT,
  internal_notes TEXT DEFAULT '',
  orders_count INTEGER NOT NULL DEFAULT 0,
  lifetime_value_eur NUMERIC(12, 2) NOT NULL DEFAULT 0,
  privacy_consent_at TIMESTAMPTZ NOT NULL,
  anonymized BOOLEAN NOT NULL DEFAULT false,
  anonymized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 4. Ordini & Logistica Dual-Source (IT / CN / Split)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT UNIQUE,
  stripe_event_id TEXT UNIQUE, -- Idempotenza webhook Stripe
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  status TEXT NOT NULL CHECK (status IN ('pagato', 'in_lavorazione_it', 'ordine_fornitore_cn', 'spedito', 'consegnato')),
  logistics_origin TEXT NOT NULL CHECK (logistics_origin IN ('italia', 'cina', 'split')),
  split_preference TEXT CHECK (split_preference IN ('split_shipments', 'single_consolidated')),
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('home', 'partner-workshop')),
  shipping_address TEXT NOT NULL,
  carrier TEXT,
  tracking_code TEXT,
  tracking_email_sent_at TIMESTAMPTZ,
  lines JSONB NOT NULL,
  units_italia INTEGER NOT NULL DEFAULT 0,
  units_cina INTEGER NOT NULL DEFAULT 0,
  subtotal_eur NUMERIC(10, 2) NOT NULL,
  pfu_total_eur NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_eur NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_eur NUMERIC(10, 2) NOT NULL,
  estimated_margin_eur NUMERIC(10, 2) NOT NULL DEFAULT 0,
  privacy_consent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_origin ON public.orders(logistics_origin);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 5. Storico Importazioni CSV Serali con Snapshot Rollback
CREATE TABLE IF NOT EXISTS public.csv_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  rows_processed INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  detected_units_sold INTEGER NOT NULL DEFAULT 0,
  rolled_back BOOLEAN NOT NULL DEFAULT false,
  rolled_back_at TIMESTAMPTZ,
  previous_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Analytics Privacy-First Cookieless (zero PII)
CREATE TABLE IF NOT EXISTS public.daily_analytics (
  day DATE PRIMARY KEY,
  unique_visits INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  cart_adds INTEGER NOT NULL DEFAULT 0,
  checkout_starts INTEGER NOT NULL DEFAULT 0,
  stripe_units_sold INTEGER NOT NULL DEFAULT 0,
  csv_units_sold INTEGER NOT NULL DEFAULT 0,
  units_italia INTEGER NOT NULL DEFAULT 0,
  units_cina INTEGER NOT NULL DEFAULT 0,
  revenue_eur NUMERIC(12, 2) NOT NULL DEFAULT 0,
  margin_eur NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.search_demand (
  size_query TEXT PRIMARY KEY,
  searches INTEGER NOT NULL DEFAULT 1,
  last_searched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Log Accessi Amministrativi & Azioni GDPR
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- Row Level Security (RLS) — Accesso pubblico solo in lettura catalogo
-- Tutti i dati CRM, ordini, CSV e log sono riservati al ruolo ADMIN
-- =====================================================================
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_demand ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_store101_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  );
$$;

CREATE POLICY "Catalogo leggibile pubblicamente"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Solo ADMIN modifica catalogo"
  ON public.products FOR ALL
  USING (public.is_store101_admin())
  WITH CHECK (public.is_store101_admin());

CREATE POLICY "Solo ADMIN accede a CRM clienti"
  ON public.customers FOR ALL
  USING (public.is_store101_admin())
  WITH CHECK (public.is_store101_admin());

CREATE POLICY "Solo ADMIN accede a ordini"
  ON public.orders FOR ALL
  USING (public.is_store101_admin())
  WITH CHECK (public.is_store101_admin());

CREATE POLICY "Solo ADMIN accede a log CSV"
  ON public.csv_import_logs FOR ALL
  USING (public.is_store101_admin())
  WITH CHECK (public.is_store101_admin());

CREATE POLICY "Solo ADMIN accede ad analytics"
  ON public.daily_analytics FOR ALL
  USING (public.is_store101_admin())
  WITH CHECK (public.is_store101_admin());

CREATE POLICY "Solo ADMIN accede ad audit log"
  ON public.admin_audit_logs FOR ALL
  USING (public.is_store101_admin())
  WITH CHECK (public.is_store101_admin());
