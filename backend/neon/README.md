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

   Setelah itu jalankan [`gallery-schema.sql`](./gallery-schema.sql) untuk
   membuat tabel galeri dan mengimpor galeri awal.
   Jalankan [`testimonials-schema.sql`](./testimonials-schema.sql) untuk
   membuat tabel ulasan dan keyword moderasi.

3. Simpan connection string sebagai `DATABASE_URL` hanya di backend:

   ```env
   DATABASE_URL=postgresql://user:password@ep-example.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ```

`DATABASE_URL` tidak boleh diberi awalan `VITE_` dan tidak boleh dikirim ke
browser. Frontend menggunakan API lokal di `backend/server.js`, yang terhubung
ke Neon.

## Menyiapkan menu dan admin

Schema membuat tabel `admins` dan empat tabel menu terpisah:
`menu_ala_carte`, `menu_paketan`, `menu_minuman`, dan
`menu_hidangan_penutup`. Jalankan schema sebelum membuat admin atau mengisi menu.
Kategori menu dibatasi ke `ala-carte`, `paketan`, `minuman`, dan
`hidangan-penutup`. Setiap tabel juga memiliki kolom `subcategory` untuk filter
internal, misalnya `ayam-bebek`, `ikan`, `jeroan`, atau `minuman-dingin`.
Subkategori baru dapat dibuat dari form admin menggunakan slug baru.

Jika database lama masih menggunakan kolom `is_best_seller`, jalankan SQL berikut
satu kali di Neon untuk mengganti namanya tanpa kehilangan data:

```sql
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'menu_items'
      AND column_name = 'is_best_seller'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'menu_items'
      AND column_name = 'is_recommended'
  ) THEN
    ALTER TABLE public.menu_items
      RENAME COLUMN is_best_seller TO is_recommended;
  END IF;
END
$$;
```

Jika database masih memakai tabel lama `menu_items`, jalankan schema baru di atas
terlebih dahulu, kemudian salin data lama ke tabel baru dengan SQL berikut:

```sql
INSERT INTO public.menu_paketan
  (id, name, category, subcategory, price, description_id, description_en, image_url,
   is_recommended, is_new, promo, is_active, sort_order, created_at, updated_at)
SELECT id, name, 'paketan', 'paket-makanan', price, description_id, description_en, image_url,
  is_recommended, is_new, promo, is_active, sort_order, created_at, updated_at
FROM public.menu_items
WHERE category = 'paket-makanan'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_minuman
  (id, name, category, subcategory, price, description_id, description_en, image_url,
   is_recommended, is_new, promo, is_active, sort_order, created_at, updated_at)
SELECT id, name, 'minuman', 'minuman-dingin', price, description_id, description_en, image_url,
  is_recommended, is_new, promo, is_active, sort_order, created_at, updated_at
FROM public.menu_items
WHERE category = 'minuman'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_hidangan_penutup
  (id, name, category, subcategory, price, description_id, description_en, image_url,
   is_recommended, is_new, promo, is_active, sort_order, created_at, updated_at)
SELECT id, name, 'hidangan-penutup', 'lainnya', price, description_id, description_en, image_url,
  is_recommended, is_new, promo, is_active, sort_order, created_at, updated_at
FROM public.menu_items
WHERE category = 'oleh-oleh'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_ala_carte
  (id, name, category, subcategory, price, description_id, description_en, image_url,
   is_recommended, is_new, promo, is_active, sort_order, created_at, updated_at)
SELECT id, name, 'ala-carte',
  CASE
    WHEN category IN ('lauk-ayam-bebek') THEN 'ayam-bebek'
    WHEN category = 'lauk-ikan' THEN 'ikan'
    WHEN category = 'jeroan' THEN 'jeroan'
    ELSE 'lainnya'
  END,
  price, description_id, description_en, image_url,
  is_recommended, is_new, promo, is_active, sort_order, created_at, updated_at
FROM public.menu_items
WHERE category NOT IN ('paket-makanan', 'minuman', 'oleh-oleh')
ON CONFLICT (id) DO NOTHING;
```

Setelah memastikan data sudah tampil, tabel lama `menu_items` dapat dihapus
secara manual. Jangan mengenkripsi nama, harga, deskripsi, atau URL gambar karena
data tersebut memang harus dikirim ke website. Password admin sudah di-hash
dengan scrypt, dan query backend memakai parameter sehingga input pengguna tidak
dapat menjadi SQL.

Jika tabel menu baru sudah pernah dibuat sebelum kolom filter ditambahkan,
jalankan penyesuaian subkategori berikut satu kali:

```sql
ALTER TABLE public.menu_ala_carte
  ADD COLUMN IF NOT EXISTS subcategory text NOT NULL DEFAULT 'lainnya';
ALTER TABLE public.menu_paketan
  ADD COLUMN IF NOT EXISTS subcategory text NOT NULL DEFAULT 'paketan';
ALTER TABLE public.menu_minuman
  ADD COLUMN IF NOT EXISTS subcategory text NOT NULL DEFAULT 'minuman-signature';
ALTER TABLE public.menu_hidangan_penutup
  ADD COLUMN IF NOT EXISTS subcategory text NOT NULL DEFAULT 'lainnya';

UPDATE public.menu_ala_carte
SET subcategory = CASE
  WHEN lower(name) LIKE '%ayam%' OR lower(name) LIKE '%bebek%' THEN 'ayam-bebek'
  WHEN lower(name) LIKE '%bandeng%' OR lower(name) LIKE '%barakuda%'
    OR lower(name) LIKE '%gurame%' OR lower(name) LIKE '%baronang%'
    OR lower(name) LIKE '%nila%' THEN 'ikan'
  WHEN lower(name) LIKE '%usus%' THEN 'jeroan'
  ELSE 'lainnya'
END;

UPDATE public.menu_minuman
SET subcategory = CASE
  WHEN lower(name) LIKE '%teh%' THEN 'teh'
  WHEN lower(name) LIKE '%jeruk%' THEN 'jus'
  ELSE 'minuman-signature'
END;
```

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
melalui halaman admin, bukan file data statis. Buka `http://localhost:5173/admin-portal`
untuk login dan mengelola menu. API publik `GET /api/menu` hanya mengirim menu
aktif; endpoint `/api/admin/menu` memerlukan sesi admin. Jalur tersebut dapat
diganti dengan environment frontend `VITE_ADMIN_PATH`.

Pada development lokal, foto dapat dipilih dari komputer. Backend menyimpannya
di `frontend/public/asset/images/menu`.

Foto yang diunggah disimpan di `frontend/public/asset/images/menu` saat
berjalan lokal. Di Vercel, gambar disimpan sebagai data URL di database karena
filesystem serverless tidak persisten.

Halaman admin juga menyediakan pengelolaan foto dan video galeri. Format yang
didukung adalah JPEG, PNG, WebP, GIF, MP4, WebM, dan OGG dengan ukuran maksimal
3 MB per file. Setiap media dapat dikategorikan sebagai Momen, Tempat &
Restoran, atau Fasilitas. Di Vercel, media galeri disimpan sebagai data URL di
database.

Ulasan pelanggan yang dikirim dari website berstatus menunggu persetujuan.
Admin dapat menyetujui, menolak, atau menghapus ulasan melalui tab Kelola
Ulasan. Keyword terlarang diperiksa di server sebelum ulasan disimpan dan
sebelum ulasan disetujui untuk publik.

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
