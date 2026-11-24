-- Alas Daun - Neon schema for editable gallery media
-- Run this file in the Neon SQL Editor after the existing schema.

-- Convert legacy enum/category values from earlier gallery implementations.
DO $$
BEGIN
  IF to_regclass('public.gallery_items') IS NOT NULL THEN
    ALTER TABLE public.gallery_items
      ALTER COLUMN category TYPE text
      USING category::text;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'momen_di_alas_daun',
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL CHECK (
    media_url ~ '^https?://'
    OR media_url ~ '^/asset/images/gallery/'
    OR media_url ~ '^data:(image|video)/(jpeg|png|webp|gif|mp4|webm|ogg);base64,[A-Za-z0-9+/]+=*$'
  ),
  alt_text text NOT NULL CHECK (char_length(btrim(alt_text)) BETWEEN 1 AND 160),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

UPDATE public.gallery_items
SET category = CASE category
  WHEN 'moments' THEN 'momen_di_alas_daun'
  WHEN 'place' THEN 'tempat_di_alas_daun'
  WHEN 'facilities' THEN 'behind_the_scene'
  WHEN 'behind-scenes' THEN 'behind_the_scene'
  ELSE category
END
WHERE category IN ('moments', 'place', 'facilities', 'behind-scenes');

CREATE INDEX IF NOT EXISTS gallery_items_public_order_idx
  ON gallery_items (is_active, sort_order, created_at);

DROP INDEX IF EXISTS gallery_items_media_url_idx;

DO $$
DECLARE
  check_name text;
BEGIN
  FOR check_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.gallery_items'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%media_url%'
  LOOP
    EXECUTE format('ALTER TABLE public.gallery_items DROP CONSTRAINT %I', check_name);
  END LOOP;
END
$$;

ALTER TABLE public.gallery_items
  ADD CONSTRAINT gallery_items_media_url_check CHECK (
    media_url ~ '^https?://'
    OR media_url ~ '^/asset/images/gallery/'
    OR media_url ~ '^data:(image|video)/(jpeg|png|webp|gif|mp4|webm|ogg);base64,[A-Za-z0-9+/]+=*$'
  );

CREATE OR REPLACE FUNCTION set_gallery_items_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gallery_items_set_updated_at ON gallery_items;

CREATE TRIGGER gallery_items_set_updated_at
BEFORE UPDATE ON gallery_items
FOR EACH ROW
EXECUTE FUNCTION set_gallery_items_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.gallery_items) THEN
    INSERT INTO gallery_items (media_type, media_url, alt_text, sort_order)
    VALUES
  ('image', 'https://images.pexels.com/photos/37303212/pexels-photo-37303212.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Hidangan lengkap di atas daun pisang', 0),
  ('image', 'https://images.pexels.com/photos/37065020/pexels-photo-37065020.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sebaran masakan tradisional di meja kayu', 1),
  ('image', 'https://images.pexels.com/photos/38734532/pexels-photo-38734532.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Pengunjung menikmati hidangan di resto', 2),
  ('image', 'https://images.pexels.com/photos/12676939/pexels-photo-12676939.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sajian dalam mangkuk daun pisang', 3),
  ('image', 'https://images.pexels.com/photos/37066472/pexels-photo-37066472.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Nasi Padang di atas daun pisang', 4),
  ('image', 'https://images.pexels.com/photos/36425664/pexels-photo-36425664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Keluarga menikmati makan bersama', 5),
  ('image', 'https://images.pexels.com/photos/40418724/pexels-photo-40418724.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Nasi campur dengan es teh', 6),
  ('image', 'https://images.pexels.com/photos/37179935/pexels-photo-37179935.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sajian masakan Indonesia di meja kayu', 7),
  ('image', 'https://images.pexels.com/photos/36363436/pexels-photo-36363436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Ayah dan anak berbagi makanan tradisional', 8),
  ('image', 'https://images.pexels.com/photos/37081088/pexels-photo-37081088.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sepiring makan dengan es teh segar', 9),
  ('image', 'https://images.pexels.com/photos/8507683/pexels-photo-8507683.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Keluarga makan bersama dengan gembira', 10),
  ('image', 'https://images.pexels.com/photos/37081070/pexels-photo-37081070.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Daging gepuk goreng renyah', 11)
    ;
  END IF;
END
$$;
