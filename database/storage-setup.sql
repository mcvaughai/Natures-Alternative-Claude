-- ============================================================
-- Nature's Alternative Marketplace — Storage Buckets Setup
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ─── Create buckets ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images',   'product-images',   true),
  ('seller-logos',     'seller-logos',     true),
  ('seller-banners',   'seller-banners',   true),
  ('profile-avatars',  'profile-avatars',  true),
  ('review-images',    'review-images',    true),
  ('platform-assets',  'platform-assets',  true)
ON CONFLICT (id) DO NOTHING;

-- ─── Product images — authenticated sellers can upload, public can view ──────

CREATE POLICY "product_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "product_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "product_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─── Seller logos — public read, authenticated upload ────────────────────────

CREATE POLICY "seller_logos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'seller-logos');

CREATE POLICY "seller_logos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'seller-logos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "seller_logos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'seller-logos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─── Seller banners ──────────────────────────────────────────────────────────

CREATE POLICY "seller_banners_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'seller-banners');

CREATE POLICY "seller_banners_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'seller-banners'
    AND auth.role() = 'authenticated'
  );

-- ─── Profile avatars — user can manage their own ─────────────────────────────

CREATE POLICY "profile_avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

CREATE POLICY "profile_avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─── Review images ───────────────────────────────────────────────────────────

CREATE POLICY "review_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "review_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images'
    AND auth.role() = 'authenticated'
  );

-- ─── Platform assets — public read only ──────────────────────────────────────

CREATE POLICY "platform_assets_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'platform-assets');
