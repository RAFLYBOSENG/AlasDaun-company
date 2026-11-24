import assert from 'node:assert/strict';
import test from 'node:test';
import { validateGalleryItem } from './gallery-controller.js';

test('validates gallery create and update data', () => {
  const item = validateGalleryItem({
    category: 'momen_di_alas_daun',
    type: 'image',
    src: '/asset/images/gallery/123e4567-e89b-12d3-a456-426614174000.jpg',
    alt: 'Suasana makan bersama',
    sortOrder: 2,
  });

  assert.deepEqual(item, {
    category: 'momen_di_alas_daun',
    type: 'image',
    src: '/asset/images/gallery/123e4567-e89b-12d3-a456-426614174000.jpg',
    alt: 'Suasana makan bersama',
    sortOrder: 2,
    isActive: true,
  });
});

test('normalizes legacy gallery categories', () => {
  const item = validateGalleryItem({
    category: 'behind-scenes',
    type: 'image',
    src: 'https://example.com/gallery.jpg',
    alt: 'Dapur',
    sortOrder: 0,
  });

  assert.equal(item.category, 'behind_the_scene');
});
