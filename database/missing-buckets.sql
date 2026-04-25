-- ============================================================
-- Nature's Alternative Marketplace — Missing Storage Buckets
-- Run this in the Supabase SQL Editor to add the two buckets
-- needed for farm post images and general farm photography.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('farm-images', 'farm-images', true),
  ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Farm images policies ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "farm_images_select" ON storage.objects;
CREATE POLICY "farm_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'farm-images');

DROP POLICY IF EXISTS "farm_images_insert" ON storage.objects;
CREATE POLICY "farm_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'farm-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "farm_images_update" ON storage.objects;
CREATE POLICY "farm_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'farm-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "farm_images_delete" ON storage.objects;
CREATE POLICY "farm_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'farm-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─── Post images policies ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "post_images_select" ON storage.objects;
CREATE POLICY "post_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "post_images_insert" ON storage.objects;
CREATE POLICY "post_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "post_images_update" ON storage.objects;
CREATE POLICY "post_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "post_images_delete" ON storage.objects;
CREATE POLICY "post_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
