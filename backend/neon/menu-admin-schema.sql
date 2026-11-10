-- Alas Daun - Neon schema for admin authentication and separated menu tables.
-- Run this file in the Neon SQL Editor.

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

CREATE OR REPLACE FUNCTION set_menu_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  menu_table text;
  menu_category text;
BEGIN
  FOR menu_table, menu_category IN
    SELECT * FROM (VALUES
      ('menu_ala_carte', 'ala-carte'),
      ('menu_paketan', 'paketan'),
      ('menu_minuman', 'minuman'),
      ('menu_hidangan_penutup', 'hidangan-penutup')
    ) AS menu_tables(table_name, category)
  LOOP
    EXECUTE format($sql$
      CREATE TABLE IF NOT EXISTS public.%I (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
        category text NOT NULL DEFAULT %L CHECK (category = %L),
        price integer NOT NULL CHECK (price > 0),
        description_id text NOT NULL CHECK (char_length(btrim(description_id)) BETWEEN 1 AND 1000),
        description_en text NOT NULL CHECK (char_length(btrim(description_en)) BETWEEN 1 AND 1000),
        subcategory text NOT NULL CHECK (subcategory ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
          AND char_length(subcategory) BETWEEN 1 AND 60),
        image_url text NOT NULL CONSTRAINT %I
          CHECK (image_url ~ '^https?://'
            OR image_url ~ '^/asset/images/menu/[0-9a-f-]+\.(jpg|png|webp|gif)$'
            OR image_url ~ '^data:image/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$'),
        is_recommended boolean NOT NULL DEFAULT false,
        is_new boolean NOT NULL DEFAULT false,
        promo integer CHECK (promo IS NULL OR promo BETWEEN 1 AND 99),
        is_active boolean NOT NULL DEFAULT true,
        sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    $sql$, menu_table, menu_category, menu_category,
      menu_table || '_image_url_check');

    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS subcategory text NOT NULL DEFAULT %L',
      menu_table, 'lainnya');
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (is_active, sort_order, name)',
      menu_table || '_public_order_idx', menu_table);
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON public.%I',
      menu_table || '_set_updated_at', menu_table);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION set_menu_updated_at()',
      menu_table || '_set_updated_at', menu_table);
  END LOOP;
END
$$;
