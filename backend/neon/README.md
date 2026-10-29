# Neon PostgreSQL

## Menjalankan schema

1. Buat project di [Neon](https://neon.tech) dan salin connection string dari
   **Connect**.
2. Buka **SQL Editor**, tempel isi [`schema.sql`](./schema.sql), lalu jalankan.
   Alternatif melalui terminal:

   ```bash
   psql "$DATABASE_URL" -f backend/neon/schema.sql
   ```

3. Simpan connection string sebagai `DATABASE_URL` hanya di backend atau
   serverless function:

   ```env
   DATABASE_URL=postgresql://user:password@ep-example.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ```

`DATABASE_URL` tidak boleh diberi awalan `VITE_` dan tidak boleh dikirim ke
browser. Frontend menggunakan API pada `backend/server.js`, dan API tersebut
yang terhubung ke Neon menggunakan `DATABASE_URL`.

Kolom `time` menggunakan tipe PostgreSQL `time`. Jika endpoint menerima nilai
jam dari form sebagai string seperti `18:00`, PostgreSQL dapat menyimpannya
langsung ke kolom tersebut.

## Tes koneksi

Setelah `backend/.env` sudah diisi dan schema sudah dijalankan:

```powershell
cd "D:\arsip magang alas daun\project\backend"
npm run dev
```

Di terminal PowerShell lain, panggil health check:

```powershell
Invoke-RestMethod http://localhost:3001/api/health/db
```

Jika berhasil, hasilnya memiliki `connected: True`, nama database Neon, dan
waktu server PostgreSQL. Jika gagal, periksa `DATABASE_URL`, pastikan schema
dan project Neon aktif, lalu lihat pesan error pada terminal backend.

## Deploy ke Vercel

Import repository/project ini ke Vercel dengan **Root Directory** tetap di
root project, bukan `frontend` atau `backend`. Konfigurasi pada `vercel.json`
akan membuild frontend dan memakai `api/[...path].js` sebagai Vercel
Serverless Function.

Tambahkan Environment Variables berikut di Vercel untuk environment
`Production` dan `Preview`:

```text
DATABASE_URL=connection-string-dari-Neon
ADMIN_EMAIL=alamat-email-admin
ADMIN_PASSWORD=password-admin-yang-kuat
SESSION_SECRET=random-secret-panjang
```

Jangan menambahkan `DATABASE_URL` sebagai `VITE_*`. Setelah deploy, tes:

```text
https://domain-vercel-anda.vercel.app/api/health/db
```

Frontend otomatis memakai URL `/api` dari domain Vercel yang sama.
