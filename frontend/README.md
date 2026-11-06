# Alas Daun Frontend

Frontend React dengan JavaScript (JS/JSX) untuk website RM Alas Daun. Vite
menjalankan development server dan Tailwind CSS menangani styling.

## Menjalankan

```bash
npm install
npm run dev
```

Backend Node.js dan database Neon tetap berada di repository. Untuk
menjalankan backend secara terpisah:

```bash
cd ../backend
npm install
npm run admin:create
npm run menu:seed
npm run dev
```

Sebelum menjalankan perintah tersebut, salin `backend/.env.example` ke
`backend/.env`, isi `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, dan
`ADMIN_PASSWORD`, lalu jalankan schema Neon. Buka `/` untuk melihat menu dari
database dan `/#/admin` untuk login serta mengelolanya. Panduan database lengkap tersedia di
[`../backend/neon/README.md`](../backend/neon/README.md).

## Deploy ke Vercel

1. Import repository ini ke Vercel dengan **Root Directory** tetap di root
   repository (jangan memilih `frontend`).
2. Vercel akan memakai konfigurasi [`../vercel.json`](../vercel.json):
   build frontend ke `frontend/dist` dan menjalankan folder `api/` sebagai
   serverless function.
3. Tambahkan environment variables berikut di Vercel untuk environment yang
   digunakan (Production, Preview, atau Development):

   - `DATABASE_URL` — connection string Neon
   - `SESSION_SECRET` — secret acak minimal 32 karakter
   - `ADMIN_EMAIL` — email admin awal
   - `ADMIN_PASSWORD` — password admin awal minimal 12 karakter

4. Jalankan seluruh schema SQL di Neon sebelum membuka halaman admin. Setelah
   deployment pertama, buat akun admin dengan menjalankan provisioning dari
   lingkungan lokal yang memiliki environment variables yang sama:

   ```bash
   cd backend
   npm install
   npm run admin:create
   npm run menu:seed
   ```

   Jangan menambahkan file `.env` ke Git atau menyalin nilainya ke source code.
   Gunakan Vercel Project Settings untuk menyimpan secret production.
5. Upload gambar dan media di Vercel disimpan sebagai data URL di database
   karena filesystem serverless tidak persisten.
