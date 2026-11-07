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

### Troubleshooting koneksi database di Vercel

`backend/.env` hanya digunakan untuk development lokal dan tidak dikirim ke
Vercel. Di Vercel buka **Project Settings > Environment Variables**, lalu
tambahkan variabel berikut pada environment yang sedang dideploy:

- `DATABASE_URL` — connection string lengkap dari Neon, termasuk
  `sslmode=require`
- `SESSION_SECRET` — secret acak minimal 32 karakter
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Pastikan variabel ditambahkan ke **Production** bila yang dibuka adalah URL
production, atau ke **Preview** bila menguji deployment preview. Setelah
menyimpan perubahan, lakukan redeploy karena environment variables hanya
tersedia pada deployment baru.

Tes endpoint `https://domain-anda.vercel.app/api/health/db`. Jika responsnya
`DATABASE_URL is not configured`, variabel belum tersedia pada environment
deployment. Jika responsnya `Terjadi kesalahan pada server`, buka **Vercel
Dashboard > Deployments > deployment > Functions > api/index.js > Logs** untuk
melihat error koneksi atau schema dari Neon.

Jika health check berhasil tetapi browser melaporkan error CORS, jangan isi
`FRONTEND_ORIGIN` dengan `http://localhost:5173` pada environment Vercel.
Hapus variabel tersebut untuk deployment same-origin, atau isi dengan URL
frontend Vercel yang sebenarnya.
