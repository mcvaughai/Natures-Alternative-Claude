-- ============================================================
-- Nature's Alternative Marketplace — Storage Setup (Safe / Idempotent)
-- Safe to re-run: ON CONFLICT DO NOTHING on buckets,
-- DROP POLICY IF EXISTS before every storage policy.
-- ============================================================

-- ─── Create buckets ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images',  'product-images',  true),
  ('seller-logos',    'seller-logos',    true),
  ('seller-banners',  'seller-banners',  true),
  ('profile-avatars', 'profile-avatars', true),
  ('review-images',   'review-images',   true),
  ('platform-assets', 'platform-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Product images ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
CREATE POLICY "product_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
CREATE POLICY "product_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
CREATE POLICY "product_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
CREATE POLICY "product_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─── Seller logos ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "seller_logos_select" ON storage.objects;
CREATE POLICY "seller_logos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'seller-logos');

DROP POLICY IF EXISTS "seller_logos_insert" ON storage.objects;
CREATE POLICY "seller_logos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'seller-logos'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "seller_logos_update" ON storage.objects;
CREATE POLICY "seller_logos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'seller-logos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─── Seller banners ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "seller_banners_select" ON storage.objects;
CREATE POLICY "seller_banners_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'seller-banners');

DROP POLICY IF EXISTS "seller_banners_insert" ON storage.objects;
CREATE POLICY "seller_banners_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'seller-banners'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "seller_banners_update" ON storage.objects;
CREATE POLICY "seller_banners_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'seller-banners'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─── Profile avatars ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profile_avatars_select" ON storage.objects;
CREATE POLICY "profile_avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "profile_avatars_insert" ON storage.objects;
CREATE POLICY "profile_avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "profile_avatars_update" ON storage.objects;
CREATE POLICY "profile_avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "profile_avatars_delete" ON storage.objects;
CREATE POLICY "profile_avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─── Review images ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "review_images_select" ON storage.objects;
CREATE POLICY "review_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

DROP POLICY IF EXISTS "review_images_insert" ON storage.objects;
CREATE POLICY "review_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images'
    AND auth.role() = 'authenticated'
  );

-- ─── Platform assets ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "platform_assets_select" ON storage.objects;
CREATE POLICY "platform_assets_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'platform-assets');
