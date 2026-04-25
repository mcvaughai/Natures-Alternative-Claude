-- ─────────────────────────────────────────────────────────────────────────────
-- seller_applications RLS policies
-- Run this in Supabase SQL Editor if applications are not saving or loading.
-- Uses DROP POLICY IF EXISTS to be safe on re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- Make sure RLS is enabled on the table
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

-- ── INSERT: Anyone (including unauthenticated visitors) can submit ─────────────
DROP POLICY IF EXISTS "Anyone can submit seller application" ON public.seller_applications;
CREATE POLICY "Anyone can submit seller application"
ON public.seller_applications
FOR INSERT
WITH CHECK (true);

-- ── SELECT: Public read so admin portal can fetch all applications ─────────────
DROP POLICY IF EXISTS "Admin can view all applications" ON public.seller_applications;
CREATE POLICY "Admin can view all applications"
ON public.seller_applications
FOR SELECT
USING (true);

-- ── UPDATE: Allow status changes (approve / reject) ───────────────────────────
DROP POLICY IF EXISTS "Admin can update applications" ON public.seller_applications;
CREATE POLICY "Admin can update applications"
ON public.seller_applications
FOR UPDATE
USING (true);

-- ── DELETE: Only authenticated users (admins) can delete ─────────────────────
DROP POLICY IF EXISTS "Admin can delete applications" ON public.seller_applications;
CREATE POLICY "Admin can delete applications"
ON public.seller_applications
FOR DELETE
USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────────────────────────────────────────
-- Verify the table has the expected columns.
-- Run this to check — if columns are missing, run the ALTER TABLE statements
-- below to add them.
-- ─────────────────────────────────────────────────────────────────────────────

-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'seller_applications'
-- ORDER BY ordinal_position;


-- ─────────────────────────────────────────────────────────────────────────────
-- If seller_applications is missing columns that the form expects, run these:
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS reference_number         TEXT;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS address                  TEXT;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS zip                      TEXT;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS fulfillment_methods      TEXT[];
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS farming_practices        TEXT;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS uses_synthetic_pesticides BOOLEAN;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS sells_gmo_products       BOOLEAN;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS practices_monocrop       BOOLEAN;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS is_certified_organic     BOOLEAN;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS organic_certification    TEXT;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS unique_description       TEXT;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS agreed_to_terms         BOOLEAN DEFAULT false;
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS product_types           TEXT[];
