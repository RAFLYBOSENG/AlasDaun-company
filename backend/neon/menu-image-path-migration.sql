-- Allow menu image URLs to reference uploaded files in the local public folder.
-- Run this once on a database where menu_items already exists.

ALTER TABLE menu_items
  DROP CONSTRAINT IF EXISTS menu_items_image_url_check;

ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_image_url_check
    CHECK (
      image_url ~ '^https?://'
      OR image_url ~ '^/asset/images/menu/[0-9a-f-]+\.(jpg|png|webp|gif)$'
    );
