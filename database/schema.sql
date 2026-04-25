-- ============================================================
-- Nature's Alternative Marketplace — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS / PROFILES ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  phone         TEXT,
  zip_code      TEXT,
  avatar_url    TEXT,
  newsletter    BOOLEAN DEFAULT false,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.subcategories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, slug)
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subcategories_select_all" ON public.subcategories FOR SELECT USING (true);

-- ─── SELLERS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sellers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  slug              TEXT NOT NULL UNIQUE,
  farm_name         TEXT NOT NULL,
  owner_name        TEXT,
  email             TEXT NOT NULL,
  phone             TEXT,
  description       TEXT,
  location          TEXT,
  city              TEXT,
  state             TEXT,
  zip_code          TEXT,
  logo_url          TEXT,
  banner_url        TEXT,
  fulfillment       TEXT[] DEFAULT '{}',
  certifications    TEXT[] DEFAULT '{}',
  product_types     TEXT[] DEFAULT '{}',
  rating            NUMERIC(3,2) DEFAULT 0,
  review_count      INT DEFAULT 0,
  product_count     INT DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  featured          BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sellers_select_approved" ON public.sellers FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "sellers_update_own" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);

-- ─── SELLER APPLICATIONS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.seller_applications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  farm_name           TEXT NOT NULL,
  owner_name          TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  city                TEXT,
  state               TEXT,
  zip_code            TEXT,
  description         TEXT,
  product_types       TEXT[] DEFAULT '{}',
  fulfillment         TEXT[] DEFAULT '{}',
  certifications      TEXT[] DEFAULT '{}',
  website             TEXT,
  instagram           TEXT,
  years_farming       TEXT,
  additional_info     TEXT,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by         UUID REFERENCES public.profiles(id),
  reviewed_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications_insert_any" ON public.seller_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "applications_select_own" ON public.seller_applications FOR SELECT USING (auth.uid() = user_id);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id       UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.categories(id),
  subcategory_id  UUID REFERENCES public.subcategories(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  compare_price   NUMERIC(10,2),
  unit            TEXT DEFAULT 'each',
  weight          TEXT,
  images          TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  certifications  TEXT[] DEFAULT '{}',
  in_stock        BOOLEAN DEFAULT true,
  stock_qty       INT,
  featured        BOOLEAN DEFAULT false,
  rating          NUMERIC(3,2) DEFAULT 0,
  review_count    INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (seller_id, slug)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (status = 'active' OR EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid()));
CREATE POLICY "products_insert_own_seller" ON public.products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid()));
CREATE POLICY "products_update_own_seller" ON public.products FOR UPDATE USING (EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid()));
CREATE POLICY "products_delete_own_seller" ON public.products FOR DELETE USING (EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid()));

-- ─── PRODUCT REVIEWS ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id    UUID,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  images      TEXT[] DEFAULT '{}',
  verified    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- ─── ADDRESSES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label         TEXT DEFAULT 'Home',
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  line1         TEXT NOT NULL,
  line2         TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  zip_code      TEXT NOT NULL,
  country       TEXT NOT NULL DEFAULT 'US',
  phone         TEXT,
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_own" ON public.addresses USING (auth.uid() = user_id);

-- ─── CART ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_own" ON public.cart_items USING (auth.uid() = user_id);

-- ─── WISHLIST ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist_own" ON public.wishlist_items USING (auth.uid() = user_id);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT NOT NULL UNIQUE DEFAULT 'ORD-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal        NUMERIC(10,2) NOT NULL,
  shipping_cost   NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax             NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  shipping_address JSONB,
  payment_method  TEXT,
  payment_status  TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id),
  seller_id   UUID NOT NULL REFERENCES public.sellers(id),
  name        TEXT NOT NULL,
  image       TEXT,
  price       NUMERIC(10,2) NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  subtotal    NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
);

-- ─── AUTO HARVEST ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.auto_harvest_lists (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  description             TEXT,
  frequency               TEXT NOT NULL DEFAULT 'biweekly',
  start_date              DATE,
  end_date                DATE,
  no_end_date             BOOLEAN DEFAULT true,
  fulfillment             TEXT DEFAULT 'delivery',
  substitution_preference TEXT DEFAULT 'substitute',
  notify_before           BOOLEAN DEFAULT true,
  notify_confirmed        BOOLEAN DEFAULT true,
  notify_ready            BOOLEAN DEFAULT false,
  status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  next_order_date         DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.auto_harvest_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auto_harvest_lists_own" ON public.auto_harvest_lists USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.auto_harvest_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id     UUID NOT NULL REFERENCES public.auto_harvest_lists(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id),
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (list_id, product_id)
);

ALTER TABLE public.auto_harvest_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auto_harvest_items_own" ON public.auto_harvest_items USING (
  EXISTS (SELECT 1 FROM public.auto_harvest_lists WHERE id = list_id AND user_id = auth.uid())
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications USING (auth.uid() = user_id);

-- ─── PLATFORM SETTINGS ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_settings_select_all" ON public.platform_settings FOR SELECT USING (true);

-- ─── PROMOTIONS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.promotions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value           NUMERIC(10,2),
  min_order       NUMERIC(10,2),
  max_uses        INT,
  uses_count      INT DEFAULT 0,
  seller_id       UUID REFERENCES public.sellers(id),
  active          BOOLEAN DEFAULT true,
  starts_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotions_select_active" ON public.promotions FOR SELECT USING (active = true);

-- ─── PAYOUTS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payouts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  method      TEXT,
  reference   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payouts_select_own_seller" ON public.payouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
);

-- ─── SEED DATA — Categories ───────────────────────────────────────────────────

INSERT INTO public.categories (slug, name, sort_order) VALUES
  ('meat-poultry',      'Meat & Poultry',      1),
  ('fruits-vegetables', 'Fruits & Vegetables', 2),
  ('dairy-eggs',        'Dairy & Eggs',        3),
  ('seafood',           'Seafood',             4),
  ('bakery-breads',     'Bakery & Breads',     5),
  ('honey-preserves',   'Honey & Preserves',   6),
  ('herbs-botanicals',  'Herbs & Botanicals',  7),
  ('natural-skincare',  'Natural Skincare',    8),
  ('candles-home',      'Candles & Home',      9),
  ('natural-cleaning',  'Natural Cleaning',   10)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories
INSERT INTO public.subcategories (category_id, slug, name, sort_order)
SELECT c.id, sub.slug, sub.name, sub.sort_order
FROM public.categories c
JOIN (VALUES
  ('meat-poultry',      'grass-fed-beef',         'Grass-Fed Beef',         1),
  ('meat-poultry',      'heritage-pork',           'Heritage Pork',          2),
  ('meat-poultry',      'pasture-raised-poultry',  'Pasture-Raised Poultry', 3),
  ('meat-poultry',      'lamb-goat',               'Lamb & Goat',            4),
  ('meat-poultry',      'wild-game',               'Wild Game',              5),
  ('meat-poultry',      'sausages-charcuterie',    'Sausages & Charcuterie', 6),
  ('fruits-vegetables', 'seasonal-vegetables',     'Seasonal Vegetables',    1),
  ('fruits-vegetables', 'fresh-fruits',            'Fresh Fruits',           2),
  ('fruits-vegetables', 'microgreens-sprouts',     'Microgreens & Sprouts',  3),
  ('fruits-vegetables', 'root-vegetables',         'Root Vegetables',        4),
  ('fruits-vegetables', 'salad-greens',            'Salad Greens',           5),
  ('fruits-vegetables', 'heirloom-varieties',      'Heirloom Varieties',     6),
  ('dairy-eggs',        'farm-fresh-eggs',         'Farm Fresh Eggs',        1),
  ('dairy-eggs',        'raw-milk',                'Raw Milk',               2),
  ('dairy-eggs',        'artisan-cheese',          'Artisan Cheese',         3),
  ('dairy-eggs',        'butter-cream',            'Butter & Cream',         4),
  ('dairy-eggs',        'yogurt-kefir',            'Yogurt & Kefir',         5),
  ('seafood',           'fresh-fish',              'Fresh Fish',             1),
  ('seafood',           'shellfish',               'Shellfish',              2),
  ('seafood',           'smoked-seafood',          'Smoked Seafood',         3),
  ('seafood',           'caviar-roe',              'Caviar & Roe',           4),
  ('bakery-breads',     'sourdough-bread',         'Sourdough Bread',        1),
  ('bakery-breads',     'whole-grain-breads',      'Whole Grain Breads',     2),
  ('bakery-breads',     'pastries-sweets',         'Pastries & Sweets',      3),
  ('bakery-breads',     'tortillas-flatbreads',    'Tortillas & Flatbreads', 4),
  ('bakery-breads',     'granola-cereals',         'Granola & Cereals',      5),
  ('bakery-breads',     'stone-ground-flour',      'Stone Ground Flour',     6),
  ('honey-preserves',   'raw-honey',               'Raw Honey',              1),
  ('honey-preserves',   'jams-jellies',            'Jams & Jellies',         2),
  ('honey-preserves',   'pickles-ferments',        'Pickles & Ferments',     3),
  ('honey-preserves',   'maple-syrup',             'Maple Syrup',            4),
  ('honey-preserves',   'sauces-condiments',       'Sauces & Condiments',    5),
  ('herbs-botanicals',  'fresh-herbs',             'Fresh Herbs',            1),
  ('herbs-botanicals',  'dried-herbs-spices',      'Dried Herbs & Spices',   2),
  ('herbs-botanicals',  'herbal-teas',             'Herbal Teas',            3),
  ('herbs-botanicals',  'tinctures-extracts',      'Tinctures & Extracts',   4),
  ('herbs-botanicals',  'medicinal-mushrooms',     'Medicinal Mushrooms',    5),
  ('natural-skincare',  'face-care',               'Face Care',              1),
  ('natural-skincare',  'body-care',               'Body Care',              2),
  ('natural-skincare',  'lip-care',                'Lip Care',               3),
  ('natural-skincare',  'hair-care',               'Hair Care',              4),
  ('natural-skincare',  'suncare-insect-repellent','Suncare & Insect Repellent', 5),
  ('candles-home',      'beeswax-candles',         'Beeswax Candles',        1),
  ('candles-home',      'soy-candles',             'Soy Candles',            2),
  ('candles-home',      'home-fragrance',          'Home Fragrance',         3),
  ('candles-home',      'home-decor',              'Home Decor',             4),
  ('natural-cleaning',  'all-purpose-cleaners',    'All-Purpose Cleaners',   1),
  ('natural-cleaning',  'laundry',                 'Laundry',                2),
  ('natural-cleaning',  'dish-soap',               'Dish Soap',              3),
  ('natural-cleaning',  'bathroom-cleaners',       'Bathroom Cleaners',      4)
) AS sub(cat_slug, slug, name, sort_order)
ON (c.slug = sub.cat_slug)
ON CONFLICT (category_id, slug) DO NOTHING;

-- ─── SEED DATA — Platform Settings ───────────────────────────────────────────

INSERT INTO public.platform_settings (key, value) VALUES
  ('commission_rate',       '{"percentage": 10}'),
  ('free_shipping_threshold', '{"amount": 50}'),
  ('tax_rate',              '{"percentage": 8}'),
  ('platform_name',         '"Nature''s Alternative"'),
  ('support_email',         '"support@naturesalternative.com"')
ON CONFLICT (key) DO NOTHING;
