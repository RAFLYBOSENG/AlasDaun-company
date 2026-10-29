-- Alas Daun - Neon PostgreSQL schema
-- Run this file in the Neon SQL Editor or with:
-- psql "$DATABASE_URL" -f neon/schema.sql
--
-- Keep DATABASE_URL on a server or serverless function. Never expose it as a
-- VITE_* variable because the Vite bundle is public.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  phone text NOT NULL CHECK (char_length(btrim(phone)) BETWEEN 8 AND 30),
  date date NOT NULL,
  time time NOT NULL,
  guests integer NOT NULL CHECK (guests BETWEEN 1 AND 100),
  area text CHECK (area IS NULL OR char_length(btrim(area)) BETWEEN 1 AND 120),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reservations_date_time_idx
  ON reservations (date, time);

CREATE INDEX IF NOT EXISTS reservations_status_created_at_idx
  ON reservations (status, created_at DESC);

CREATE OR REPLACE FUNCTION set_reservations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reservations_set_updated_at ON reservations;

CREATE TRIGGER reservations_set_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION set_reservations_updated_at();
