-- Drop the SeoPageCache table to save database space
-- SEO pages will be generated on-demand instead of pre-cached
DROP TABLE IF EXISTS "seo_page_cache" CASCADE;
