ALTER TABLE public.sellers
ADD COLUMN IF NOT EXISTS shop_banner_title text,
ADD COLUMN IF NOT EXISTS shop_banner_subtitle text;
