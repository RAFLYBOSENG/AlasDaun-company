-- Alas Daun - Neon schema for customer testimonials and moderation keywords.

CREATE TABLE IF NOT EXISTS testimonial_blocked_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL CHECK (char_length(btrim(keyword)) BETWEEN 2 AND 80),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS testimonial_blocked_keywords_lower_idx
  ON testimonial_blocked_keywords (lower(keyword));

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 80),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text NOT NULL CHECK (char_length(btrim(review_text)) BETWEEN 10 AND 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS testimonials_public_idx
  ON testimonials (status, created_at DESC);

CREATE OR REPLACE FUNCTION set_testimonials_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS testimonials_set_updated_at ON testimonials;

CREATE TRIGGER testimonials_set_updated_at
BEFORE UPDATE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION set_testimonials_updated_at();

INSERT INTO testimonial_blocked_keywords (keyword)
VALUES
  ('anjing'), ('bangsat'), ('babi'), ('tolol'), ('goblok'),
  ('jancuk'), ('kontol'), ('memek'), ('fuck'), ('shit')
ON CONFLICT DO NOTHING;
