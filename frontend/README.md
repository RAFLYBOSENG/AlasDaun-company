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

Import repository ini ke Vercel tanpa mengubah Root Directory. Konfigurasi
[`../vercel.json`](../vercel.json) akan membangun `frontend/dist` dan
mengarahkan `/api/*` ke function serverless.

Tambahkan environment variables berikut di pengaturan project Vercel:

- `DATABASE_URL`
- `SESSION_SECRET` (minimal 32 karakter)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Jalankan schema Neon dan buat admin sebelum memakai halaman admin. Upload
gambar di Vercel disimpan sebagai data URL di database karena filesystem
serverless tidak persisten.
