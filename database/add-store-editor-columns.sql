-- New sellers columns for per-page editing
ALTER TABLE public.sellers
ADD COLUMN IF NOT EXISTS hero_text text,
ADD COLUMN IF NOT EXISTS hero_subtext text,
ADD COLUMN IF NOT EXISTS mission_title text,
ADD COLUMN IF NOT EXISTS mission_text text,
ADD COLUMN IF NOT EXISTS who_we_are_title text,
ADD COLUMN IF NOT EXISTS who_we_are_text text,
ADD COLUMN IF NOT EXISTS who_we_are_image_url text,
ADD COLUMN IF NOT EXISTS about_page_banner_url text,
ADD COLUMN IF NOT EXISTS our_story_title text,
ADD COLUMN IF NOT EXISTS our_story_text text,
ADD COLUMN IF NOT EXISTS farming_practices jsonb;

-- New farm_posts columns for blog editor
ALTER TABLE public.farm_posts
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS excerpt text;
