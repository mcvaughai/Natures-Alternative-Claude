-- ─────────────────────────────────────────────────────────────────────────────
-- Blessings Ranch — Manual Seller Account Setup
--
-- Run these steps IN ORDER. Step 1 is done in the Supabase UI, not here.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── STEP 1: MANUAL — Create auth user in Supabase Dashboard ──────────────────
--
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create New User"
-- 3. Email:    brittany@mcvaugh.com
-- 4. Password: Blessings
-- 5. Click "Create User"
-- 6. Copy the UUID shown for the new user
-- 7. Replace every occurrence of PASTE-UUID-HERE below with that UUID
--    (there are 3 places)
--
-- NOTE: Creating the user in Step 1 automatically creates a row in
-- public.profiles via the handle_new_user trigger. Steps 2–4 build on that.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── STEP 2: Create the sellers record ────────────────────────────────────────
--
-- Run after replacing PASTE-UUID-HERE with the real UUID from Step 1.
-- Column notes:
--   slug         — must be unique across all sellers
--   farm_name    — display name shown on the storefront
--   fulfillment  — TEXT array: add/remove 'Local Delivery' / 'Farm Pickup' as needed
--   email        — required (NOT NULL)

INSERT INTO public.sellers (
  user_id,
  farm_name,
  owner_name,
  slug,
  status,
  city,
  state,
  email,
  description,
  fulfillment
) VALUES (
  'PASTE-UUID-HERE',
  'Blessings Ranch',
  'Brittany McVaugh',
  'blessings-ranch',
  'approved',
  'Houston',
  'TX',
  'brittany@mcvaugh.com',
  'Your local source for sustainably produced farm-fresh goods. Grass-fed beef, pasture-raised chicken, fresh eggs, raw honey and dairy.',
  ARRAY['Local Delivery', 'Farm Pickup']
);


-- ── STEP 3: Promote the profile role to seller ───────────────────────────────

UPDATE public.profiles
SET role       = 'seller',
    first_name = 'Brittany',
    last_name  = 'McVaugh'
WHERE id = 'PASTE-UUID-HERE';


-- ── STEP 4: Mark the existing application as approved ────────────────────────
--
-- Links the existing Blessings Ranch application row to this auth account.
-- Uses a subquery because PostgreSQL does not support ORDER BY in UPDATE directly.

UPDATE public.seller_applications
SET status            = 'approved',
    applicant_user_id = 'PASTE-UUID-HERE'
WHERE id = (
  SELECT id
  FROM   public.seller_applications
  WHERE  farm_name = 'Blessings Ranch'
  ORDER  BY created_at DESC
  LIMIT  1
);


-- ── STEP 5: Verify ───────────────────────────────────────────────────────────
--
-- Run this SELECT to confirm everything looks correct before logging in.

-- SELECT
--   p.id,
--   p.email,
--   p.role,
--   s.farm_name,
--   s.slug,
--   s.status
-- FROM public.profiles p
-- LEFT JOIN public.sellers s ON s.user_id = p.id
-- WHERE p.id = 'PASTE-UUID-HERE';
