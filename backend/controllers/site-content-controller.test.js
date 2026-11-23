import assert from 'node:assert/strict';
import test from 'node:test';
import { validateValue } from './site-content-controller.js';

function validAboutLanguage() {
  return {
    sectionLabel: 'Tentang Kami',
    sectionTitle: 'Filosofi di balik daun pisang.',
    welcomeMessage: 'Selamat datang.',
    founded: '2020',
    locationStory: 'Bandung',
    story: ['Cerita kami.'],
    vision: 'Menjadi rumah makan terbaik.',
    mission: ['Menyajikan makanan berkualitas.'],
    philosophy: ['Kebersamaan di meja makan.'],
    tagline: 'Rasa tradisional.',
    diningDescription: 'Pengalaman makan bersama.',
    milestones: ['Berdiri pada 2020.'],
    signatureDishes: ['Nasi liwet'],
    signatureBeverages: ['Es teh'],
    capacity: '260 kursi',
    areas: ['Indoor'],
    facilities: ['Ruang keluarga'],
    videoUrl: '/vidaboutus/about.mp4',
    youtubeUrl: 'https://youtu.be/example',
  };
}

test('validates about content with about-specific rules', () => {
  const value = {
    id: validAboutLanguage(),
    en: validAboutLanguage(),
  };

  assert.deepEqual(validateValue('about', value), value);
});

test('reports invalid about philosophy as incomplete about content', () => {
  const id = validAboutLanguage();
  id.philosophy = Array(31).fill('Filosofi');

  assert.equal(
    validateValue('about', { id, en: validAboutLanguage() }),
    'Data Tentang Kami belum lengkap atau melebihi batas karakter.',
  );
});
