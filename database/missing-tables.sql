-- ============================================================
-- Nature's Alternative Marketplace — Missing Tables
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ─── PRODUCT IMAGES ──────────────────────────────────────────────────────────
-- Stores multiple images per product with ordering and alt text

CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_images_select_all" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "product_images_insert_own_seller" ON public.product_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.sellers s ON s.id = p.seller_id
      WHERE p.id = product_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "product_images_delete_own_seller" ON public.product_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.sellers s ON s.id = p.seller_id
      WHERE p.id = product_id AND s.user_id = auth.uid()
    )
  );

-- ─── FARM POSTS ──────────────────────────────────────────────────────────────
-- Blog / update posts published by farms

CREATE TABLE IF NOT EXISTS public.farm_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  body        TEXT,
  cover_image TEXT,
  tags        TEXT[] DEFAULT '{}',
  published   BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (seller_id, slug)
);

ALTER TABLE public.farm_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "farm_posts_select_published" ON public.farm_posts
  FOR SELECT USING (
    published = true
    OR EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

CREATE POLICY "farm_posts_insert_own_seller" ON public.farm_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

CREATE POLICY "farm_posts_update_own_seller" ON public.farm_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

CREATE POLICY "farm_posts_delete_own_seller" ON public.farm_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

-- ─── FARM FOLLOWERS ──────────────────────────────────────────────────────────
-- Customers following farms to receive updates

CREATE TABLE IF NOT EXISTS public.farm_followers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id   UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, seller_id)
);

ALTER TABLE public.farm_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "farm_followers_select_own" ON public.farm_followers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "farm_followers_insert_own" ON public.farm_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "farm_followers_delete_own" ON public.farm_followers
  FOR DELETE USING (auth.uid() = user_id);

-- ─── POS TRANSACTIONS ────────────────────────────────────────────────────────
-- In-person point-of-sale transactions at markets / farm stands

CREATE TABLE IF NOT EXISTS public.pos_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id       UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  transaction_number TEXT NOT NULL UNIQUE DEFAULT 'POS-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  subtotal        NUMERIC(10,2) NOT NULL,
  tax             NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  payment_method  TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'other')),
  status          TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'voided')),
  cashier_id      UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pos_transactions_own_seller" ON public.pos_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

-- ─── POS TRANSACTION ITEMS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pos_transaction_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id),
  name            TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  quantity        INT NOT NULL DEFAULT 1,
  subtotal        NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pos_items_own_seller" ON public.pos_transaction_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pos_transactions t
      JOIN public.sellers s ON s.id = t.seller_id
      WHERE t.id = transaction_id AND s.user_id = auth.uid()
    )
  );

-- ─── INVENTORY HISTORY ───────────────────────────────────────────────────────
-- Audit log for stock level changes

CREATE TABLE IF NOT EXISTS public.inventory_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id   UUID NOT NULL REFERENCES public.sellers(id),
  change      INT NOT NULL,
  qty_before  INT,
  qty_after   INT,
  reason      TEXT CHECK (reason IN ('restock', 'sale', 'adjustment', 'return', 'damaged', 'other')),
  notes       TEXT,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_history_own_seller" ON public.inventory_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

-- ─── BUNDLES ─────────────────────────────────────────────────────────────────
-- Curated product bundles / gift boxes sold by sellers

CREATE TABLE IF NOT EXISTS public.bundles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  images      TEXT[] DEFAULT '{}',
  in_stock    BOOLEAN DEFAULT true,
  featured    BOOLEAN DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (seller_id, slug)
);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bundles_select_active" ON public.bundles
  FOR SELECT USING (
    status = 'active'
    OR EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

CREATE POLICY "bundles_manage_own_seller" ON public.bundles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

-- ─── BUNDLE ITEMS ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bundle_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id   UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id),
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order  INT DEFAULT 0,
  UNIQUE (bundle_id, product_id)
);

ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bundle_items_select_all" ON public.bundle_items
  FOR SELECT USING (true);

CREATE POLICY "bundle_items_manage_own_seller" ON public.bundle_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bundles b
      JOIN public.sellers s ON s.id = b.seller_id
      WHERE b.id = bundle_id AND s.user_id = auth.uid()
    )
  );

-- ─── CSA SHARES ──────────────────────────────────────────────────────────────
-- Community Supported Agriculture share programs offered by farms

CREATE TABLE IF NOT EXISTS public.csa_shares (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id       UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  frequency       TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  duration_weeks  INT,
  capacity        INT,
  enrolled_count  INT DEFAULT 0,
  pickup_location TEXT,
  pickup_day      TEXT,
  images          TEXT[] DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'closed', 'draft')),
  season_start    DATE,
  season_end      DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.csa_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "csa_shares_select_open" ON public.csa_shares
  FOR SELECT USING (
    status IN ('open', 'full')
    OR EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

CREATE POLICY "csa_shares_manage_own_seller" ON public.csa_shares
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  );

-- ─── CSA MEMBERS ─────────────────────────────────────────────────────────────
-- Customers enrolled in CSA share programs

CREATE TABLE IF NOT EXISTS public.csa_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id    UUID NOT NULL REFERENCES public.csa_shares(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  start_date  DATE,
  end_date    DATE,
  payment_method TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (share_id, user_id)
);

ALTER TABLE public.csa_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "csa_members_select_own" ON public.csa_members
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.csa_shares cs
      JOIN public.sellers s ON s.id = cs.seller_id
      WHERE cs.id = share_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "csa_members_insert_own" ON public.csa_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "csa_members_update_own" ON public.csa_members
  FOR UPDATE USING (auth.uid() = user_id);
