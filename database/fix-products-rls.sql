-- Allow sellers to update their own products
CREATE POLICY IF NOT EXISTS "Sellers can update own products"
ON public.products
FOR UPDATE
USING (
  seller_id IN (
    SELECT id FROM public.sellers
    WHERE user_id = auth.uid()
  )
);

-- Allow sellers to delete their own products
CREATE POLICY IF NOT EXISTS "Sellers can delete own products"
ON public.products
FOR DELETE
USING (
  seller_id IN (
    SELECT id FROM public.sellers
    WHERE user_id = auth.uid()
  )
);

-- Allow sellers to insert their own products
CREATE POLICY IF NOT EXISTS "Sellers can insert own products"
ON public.products
FOR INSERT
WITH CHECK (
  seller_id IN (
    SELECT id FROM public.sellers
    WHERE user_id = auth.uid()
  )
);

-- Re-enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active products
CREATE POLICY IF NOT EXISTS "Anyone can read active products"
ON public.products
FOR SELECT
USING (status = 'active');
