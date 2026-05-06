-- Allow anyone to view approved sellers
DROP POLICY IF EXISTS "Anyone can view approved sellers" ON public.sellers;
CREATE POLICY "Anyone can view approved sellers"
ON public.sellers
FOR SELECT
USING (status = 'approved');

-- Allow sellers to update their own profile
DROP POLICY IF EXISTS "Sellers can update own profile" ON public.sellers;
CREATE POLICY "Sellers can update own profile"
ON public.sellers
FOR UPDATE
USING (user_id = auth.uid());

-- Enable RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
