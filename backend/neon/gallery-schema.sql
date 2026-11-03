-- Alas Daun - Neon schema for editable gallery media
-- Run this file in the Neon SQL Editor after the existing schema.

CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL CHECK (
    media_url ~ '^https?://'
    OR media_url ~ '^data:(image|video)/(jpeg|png|webp|gif|mp4|webm|ogg);base64,[A-Za-z0-9+/]+=*$'
  ),
  alt_text text NOT NULL CHECK (char_length(btrim(alt_text)) BETWEEN 1 AND 160),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_items_public_order_idx
  ON gallery_items (is_active, sort_order, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS gallery_items_media_url_idx
  ON gallery_items (media_url);

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
ON CONFLICT (media_url) DO NOTHING;
