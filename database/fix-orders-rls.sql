-- RLS policies for orders table
-- Sellers can view and update their own orders
-- Customers can view and insert their own orders

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers can view own orders" ON public.orders;
CREATE POLICY "Sellers can view own orders"
ON public.orders
FOR SELECT
USING (
  seller_id IN (
    SELECT id FROM public.sellers
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Sellers can update own orders" ON public.orders;
CREATE POLICY "Sellers can update own orders"
ON public.orders
FOR UPDATE
USING (
  seller_id IN (
    SELECT id FROM public.sellers
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
ON public.orders
FOR SELECT
USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can insert orders" ON public.orders;
CREATE POLICY "Customers can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (customer_id = auth.uid());
