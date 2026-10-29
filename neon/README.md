# Neon PostgreSQL

## Menjalankan schema

1. Buat project di [Neon](https://neon.tech) dan salin connection string dari
   **Connect**.
2. Buka **SQL Editor**, tempel isi [`schema.sql`](./schema.sql), lalu jalankan.
   Alternatif melalui terminal:

   ```bash
   psql "$DATABASE_URL" -f neon/schema.sql
   ```

3. Simpan connection string sebagai `DATABASE_URL` hanya di backend atau
   serverless function:

   ```env
   DATABASE_URL=postgresql://user:password@ep-example.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ```

`DATABASE_URL` tidak boleh diberi awalan `VITE_` dan tidak boleh dikirim ke
browser. Aplikasi Vite saat ini masih menggunakan Supabase client pada
[`src/lib/supabase.ts`](../src/lib/supabase.ts); schema Neon ini siap dipakai
oleh endpoint backend/serverless yang menerima data reservasi. Koneksi langsung
dari React ke Neon akan mengekspos password database.

Kolom `time` menggunakan tipe PostgreSQL `time`. Jika endpoint menerima nilai
jam dari form sebagai string seperti `18:00`, PostgreSQL dapat menyimpannya
langsung ke kolom tersebut.
