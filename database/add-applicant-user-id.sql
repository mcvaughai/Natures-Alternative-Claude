-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor BEFORE using the updated application form.
-- Safe to re-run (all statements are idempotent).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Link each application to the Supabase auth account created at submit time
ALTER TABLE public.seller_applications
  ADD COLUMN IF NOT EXISTS applicant_user_id uuid REFERENCES auth.users(id);

-- 2. Expand the profiles role constraint to include pending/rejected seller states
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'seller', 'seller_pending', 'rejected_seller', 'admin'));

-- 3. Allow any authenticated user to update profiles
--    (needed so the admin can promote a seller's role to 'seller' on approval)
DROP POLICY IF EXISTS "Authenticated can update any profile" ON public.profiles;
CREATE POLICY "Authenticated can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 4. Allow authenticated users to INSERT into sellers
--    (needed so the admin can create the sellers record on approval)
DROP POLICY IF EXISTS "Authenticated can insert sellers" ON public.sellers;
CREATE POLICY "Authenticated can insert sellers"
  ON public.sellers
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
