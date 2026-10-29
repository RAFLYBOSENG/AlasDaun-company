# Alas Daun Frontend

Frontend React + TypeScript untuk website RM Alas Daun.

## Menjalankan

```bash
npm install
npm run dev
```

Variabel environment frontend disimpan di `.env`. Jalankan backend di terminal
lain agar reservasi tersimpan ke Neon:

```bash
cd ../backend
npm install
copy .env.example .env
npm run dev
```

Isi `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan `SESSION_SECRET` di
`backend/.env`. Schema Neon dan panduan lengkap tersedia di
[`../backend/neon/README.md`](../backend/neon/README.md).
