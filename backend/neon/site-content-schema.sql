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
    'uniquenessTagline',
    '"Bukan sekadar makan — ini adalah pengalaman."'::jsonb,
    '"Not just a meal — an experience."'::jsonb
  ),
  (
    'philosophy',
    '["Kesederhanaan", "Kerendahan hati", "Ketulusan", "Kebermanfaatan bagi banyak orang", "Kebersamaan"]'::jsonb,
    '["Simplicity", "Humility", "Sincerity", "Being beneficial to others", "Togetherness"]'::jsonb
  )
ON CONFLICT (content_key) DO NOTHING;
