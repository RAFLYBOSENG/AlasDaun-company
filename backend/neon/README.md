# Neon PostgreSQL

## Menjalankan schema

1. Buat project di [Neon](https://neon.tech) dan salin connection string dari
   **Connect**.
2. Buka **SQL Editor** dan jalankan isi
   [`menu-admin-schema.sql`](./menu-admin-schema.sql). Alternatif melalui
   terminal:

   ```bash
   psql "$DATABASE_URL" -f backend/neon/menu-admin-schema.sql
   ```

   [`schema.sql`](./schema.sql) menyediakan skema admin dan menu yang sama.

3. Simpan connection string sebagai `DATABASE_URL` hanya di backend:

   ```env
   DATABASE_URL=postgresql://user:password@ep-example.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ```

`DATABASE_URL` tidak boleh diberi awalan `VITE_` dan tidak boleh dikirim ke
browser. Frontend menggunakan API lokal di `backend/server.js`, yang terhubung
ke Neon.

## Menyiapkan menu dan admin

Schema membuat tabel `admins` dan `menu_items`. Kategori disimpan sebagai slug
di kolom `menu_items.category` (contoh `paket-makanan`), sedangkan penanda
best seller disimpan pada kolom boolean `is_best_seller`. Jalankan schema
sebelum membuat admin atau mengisi menu.

Salin `backend/.env.example` menjadi `backend/.env`, lalu isi connection string
database, secret sesi acak minimal 32 karakter, serta kredensial admin awal:

```env
DATABASE_URL=connection-string-Neon
SESSION_SECRET=random-secret-minimal-32-karakter
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password-awal-minimal-12-karakter
```

`ADMIN_EMAIL` dan `ADMIN_PASSWORD` hanya dipakai oleh skrip provisioning;
password disimpan sebagai hash scrypt, bukan teks biasa. Dari folder
`backend`, jalankan:

```bash
npm install
npm run admin:create
npm run menu:seed
npm run dev
```

`menu:seed` menyalin daftar menu lama dari frontend satu kali dan membatalkan
operasi jika tabel sudah berisi data. Setelah itu, perubahan menu dilakukan
melalui halaman admin, bukan file data statis. Buka `http://localhost:5173/#/admin`
untuk login dan mengelola menu. API publik `GET /api/menu` hanya mengirim menu
aktif; endpoint `/api/admin/menu` memerlukan sesi admin.

Pada development lokal, foto dapat dipilih dari komputer. Backend menyimpannya
di `frontend/public/asset/images/menu`. Jika database menu sudah dibuat sebelum
dukungan ini ditambahkan, jalankan [`menu-image-path-migration.sql`](./menu-image-path-migration.sql)
di Neon agar kolom `image_url` menerima path foto lokal.

Foto yang diunggah disimpan di `frontend/public/asset/images/menu`; pastikan
folder tersebut tetap tersedia saat memindahkan atau mencadangkan proyek.

## Tes koneksi

Setelah `backend/.env` sudah diisi dan schema sudah dijalankan:

```powershell
cd backend
npm run dev
```

Di terminal PowerShell lain, panggil health check:

```powershell
Invoke-RestMethod http://localhost:3001/api/health/db
```

Jika berhasil, hasilnya memiliki `connected: True`, nama database Neon, dan
waktu server PostgreSQL. Jika gagal, periksa `DATABASE_URL`, pastikan schema
dan project Neon aktif, lalu lihat pesan error pada terminal backend.
