DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'menu_items' AND column_name = 'is_best_seller'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'menu_items' AND column_name = 'is_recommended'
  ) THEN
    ALTER TABLE public.menu_items RENAME COLUMN is_best_seller TO is_recommended;
  END IF;
END
$$;
