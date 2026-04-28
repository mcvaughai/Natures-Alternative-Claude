-- Fix RLS policies for product_images table
-- Allows sellers to manage images for their own products
-- Allows anyone to view product images

-- Enable RLS on product_images table
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Sellers can manage own product images" ON public.product_images;
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;

-- Allow sellers to insert/update/delete images for their own products
CREATE POLICY "Sellers can manage own product images"
  ON public.product_images
  FOR ALL
  USING (
    product_id IN (
      SELECT id FROM public.products
      WHERE seller_id IN (
        SELECT id FROM public.sellers WHERE user_id = auth.uid()
      )
    )
  );

-- Allow anyone (including unauthenticated) to read product images
CREATE POLICY "Anyone can view product images"
  ON public.product_images
  FOR SELECT
  USING (true);
