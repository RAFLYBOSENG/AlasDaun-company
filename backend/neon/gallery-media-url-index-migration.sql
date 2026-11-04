-- Replace the full-value gallery URL index with a compact hash index.
-- Full data URLs can be up to 3 MB and exceed PostgreSQL's 8 KB index entry limit.

DROP INDEX IF EXISTS public.gallery_items_media_url_idx;

CREATE UNIQUE INDEX gallery_items_media_url_idx
  ON public.gallery_items (md5(media_url));
