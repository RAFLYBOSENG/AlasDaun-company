-- Add categories to an existing gallery_items table.

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'moments';

ALTER TABLE gallery_items
  DROP CONSTRAINT IF EXISTS gallery_items_category_check;

ALTER TABLE gallery_items
  ADD CONSTRAINT gallery_items_category_check
  CHECK (category IN ('moments', 'place', 'facilities'));
