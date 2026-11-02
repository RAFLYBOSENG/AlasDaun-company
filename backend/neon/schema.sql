-- Alas Daun - Neon PostgreSQL schema
-- Run this file in the Neon SQL Editor or with:
-- psql "$DATABASE_URL" -f neon/schema.sql
--
-- Keep DATABASE_URL on the backend. Never expose it as a VITE_* variable
-- because the Vite bundle is public.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admins_email_not_empty CHECK (char_length(btrim(email)) BETWEEN 3 AND 254)
);

CREATE UNIQUE INDEX IF NOT EXISTS admins_email_lower_idx
  ON admins (lower(email));

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  category text NOT NULL CHECK (category ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  price integer NOT NULL CHECK (price > 0),
  description_id text NOT NULL CHECK (char_length(btrim(description_id)) BETWEEN 1 AND 1000),
  description_en text NOT NULL CHECK (char_length(btrim(description_en)) BETWEEN 1 AND 1000),
  image_url text NOT NULL CONSTRAINT menu_items_image_url_check
    CHECK (image_url ~ '^https?://' OR image_url ~ '^/asset/images/menu/[0-9a-f-]+\.(jpg|png|webp|gif)$'),
  is_best_seller boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  promo integer CHECK (promo IS NULL OR promo BETWEEN 1 AND 99),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS menu_items_public_order_idx
  ON menu_items (is_active, sort_order, name);

CREATE OR REPLACE FUNCTION set_menu_items_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS menu_items_set_updated_at ON menu_items;

CREATE TRIGGER menu_items_set_updated_at
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION set_menu_items_updated_at();
