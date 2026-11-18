-- Editable public website content for the Alas Daun admin.

CREATE TABLE IF NOT EXISTS public.site_content (
  content_key text PRIMARY KEY,
  value_id jsonb NOT NULL,
  value_en jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_content (content_key, value_id, value_en)
VALUES
  (
    'uniquenessLabel',
    '"KEUNIKAN ALAS DAUN"'::jsonb,
    '"WHAT MAKES US UNIQUE"'::jsonb
  ),
  (
    'uniquenessTagline',
    '"Bukan sekadar makan — ini adalah pengalaman."'::jsonb,
    '"Not just a meal — an experience."'::jsonb
  ),
  (
    'philosophy',
    '["Kesederhanaan", "Kerendahan hati", "Ketulusan", "Kebermanfaatan bagi banyak orang", "Kebersamaan"]'::jsonb,
    '["Simplicity", "Humility", "Sincerity", "Being beneficial to others", "Togetherness"]'::jsonb
  ),
  (
    'uniquenessFeature1',
    '{"title":"Makan Tanpa Piring","description":"Setiap meja dialasi daun pisang segar sebagai pengganti piring, menghadirkan pengalaman makan tradisional yang autentik dan akrab."}'::jsonb,
    '{"title":"No-Plate Dining","description":"Dishes are served directly on a wide banana leaf on the table. No plates, only fragrant green leaves closing the distance between you and the food — a way of eating believed to enhance flavor and togetherness."}'::jsonb
  ),
  (
    'uniquenessFeature2',
    '{"title":"Nasi & Kuah Boleh Nambah","description":"Pramusaji berkeliling menyajikan nasi serta kuah sesuai porsi yang diinginkan pelanggan, menghadirkan kebersamaan di setiap meja."}'::jsonb,
    '{"title":"Unlimited Rice & Gravy","description":"Servers move around the tables serving rice and gravy according to each guest’s preference, making every meal feel shared."}'::jsonb
  ),
  (
    'uniquenessFeature3',
    '{"title":"Cocok untuk Keluarga & Rombongan","description":"Dengan kapasitas 260 kursi, tersedia area makan indoor, VIP Room, dan Meeting Room untuk keluarga maupun rombongan."}'::jsonb,
    '{"title":"Great for Families & Groups","description":"Long banana-leaf tables invite everyone to sit together. Ideal for family gatherings, office events, or groups of dozens."}'::jsonb
  ),
  (
    'uniquenessFeature4',
    '{"title":"Cita Rasa Nusantara","description":"Nikmati hidangan tradisional Indonesia dengan bahan segar dan resep tradisional dalam suasana autentik."}'::jsonb,
    '{"title":"Flavors of the Archipelago","description":"Enjoy traditional Indonesian dishes made with fresh ingredients and traditional recipes in an authentic atmosphere."}'::jsonb
  )
ON CONFLICT (content_key) DO NOTHING;
