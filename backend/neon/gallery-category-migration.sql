-- Gallery category enum migration.
-- Run this script once in the Neon SQL Editor.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'gallery_category'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.gallery_category AS ENUM (
      'momen_di_alas_daun',
      'tempat_di_alas_daun',
      'behind_the_scene'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'gallery_category' AND e.enumlabel = 'momen_di_alas_daun'
  ) THEN
    ALTER TYPE public.gallery_category ADD VALUE 'momen_di_alas_daun';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'gallery_category' AND e.enumlabel = 'tempat_di_alas_daun'
  ) THEN
    ALTER TYPE public.gallery_category ADD VALUE 'tempat_di_alas_daun';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'gallery_category' AND e.enumlabel = 'behind_the_scene'
  ) THEN
    ALTER TYPE public.gallery_category ADD VALUE 'behind_the_scene';
  END IF;
END
$$;

ALTER TABLE public.gallery_items
  ALTER COLUMN category DROP DEFAULT;

ALTER TABLE public.gallery_items
  DROP CONSTRAINT IF EXISTS gallery_items_category_check;

ALTER TABLE public.gallery_items
  ALTER COLUMN category TYPE text
  USING category::text;

UPDATE public.gallery_items
SET category = CASE
  WHEN lower(trim(category)) IN ('facilities', 'behind-scenes', 'behind_scenes', 'behind_the_scenes')
    THEN 'behind_the_scene'
  WHEN lower(trim(category)) IN ('tempat', 'place', 'tempat-restoran', 'tempat_restoran')
    THEN 'tempat_di_alas_daun'
  WHEN lower(trim(category)) IN ('moments', 'moment', 'momen', 'momen-alas-daun', 'momen_alas_daun')
    THEN 'momen_di_alas_daun'
  ELSE 'momen_di_alas_daun'
END;

ALTER TABLE public.gallery_items
  ALTER COLUMN category TYPE public.gallery_category
  USING CASE
    WHEN lower(trim(category::text)) IN ('facilities', 'behind-scenes', 'behind_scenes', 'behind_the_scenes', 'behind_the_scene')
      THEN 'behind_the_scene'::public.gallery_category
    WHEN lower(trim(category::text)) IN ('tempat', 'place', 'tempat-restoran', 'tempat_restoran', 'tempat_di_alas_daun')
      THEN 'tempat_di_alas_daun'::public.gallery_category
    ELSE 'momen_di_alas_daun'::public.gallery_category
  END;

ALTER TABLE public.gallery_items
  ALTER COLUMN category SET DEFAULT 'momen_di_alas_daun'::public.gallery_category,
  ALTER COLUMN category SET NOT NULL;

SELECT category, count(*) AS total
FROM public.gallery_items
GROUP BY category
ORDER BY category;
