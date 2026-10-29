/*
# Create reservations table for RM Alas Daun

1. New Tables
- `reservations`
- `id` (uuid, primary key)
- `name` (text, not null) — nama pemesan
- `phone` (text, not null) — nomor WhatsApp
- `date` (date, not null) — tanggal reservasi
- `time` (text, not null) — jam reservasi
- `guests` (int, not null) — jumlah orang
- `area` (text) — pilihan area (opsional)
- `notes` (text) — catatan/permintaan khusus
- `status` (text, default 'pending') — status reservasi
- `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `reservations`.
- Public (anon) can INSERT new reservations (form submission).
- Authenticated admin can SELECT, UPDATE, DELETE all reservations.
*/

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  guests int NOT NULL,
  area text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON reservations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON reservations TO authenticated;

DROP POLICY IF EXISTS "anon_insert_reservations" ON reservations;
CREATE POLICY "anon_insert_reservations" ON reservations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_reservations" ON reservations;
CREATE POLICY "admin_select_reservations" ON reservations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_reservations" ON reservations;
CREATE POLICY "admin_update_reservations" ON reservations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_reservations" ON reservations;
CREATE POLICY "admin_delete_reservations" ON reservations FOR DELETE
  TO authenticated USING (true);
