-- Editable public website content for the Alas Daun admin.

CREATE TABLE IF NOT EXISTS public.site_content (
  content_key text PRIMARY KEY,
  value_id jsonb NOT NULL,
  value_en jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_content (content_key, value_id, value_en)
VALUES
  (
    'uniquenessLabel',
    '"KEUNIKAN ALAS DAUN"'::jsonb,
    '"WHAT MAKES US UNIQUE"'::jsonb
  ),
  (
    'uniquenessTagline',
    '"Bukan sekadar makan — ini adalah pengalaman."'::jsonb,
    '"Not just a meal — an experience."'::jsonb
  ),
  (
    'philosophy',
    '["Kesederhanaan", "Kerendahan hati", "Ketulusan", "Kebermanfaatan bagi banyak orang", "Kebersamaan"]'::jsonb,
    '["Simplicity", "Humility", "Sincerity", "Being beneficial to others", "Togetherness"]'::jsonb
  ),
  (
    'uniquenessFeature1',
    '{"title":"Makan Tanpa Piring","description":"Setiap meja dialasi daun pisang segar sebagai pengganti piring, menghadirkan pengalaman makan tradisional yang autentik dan akrab."}'::jsonb,
    '{"title":"No-Plate Dining","description":"Dishes are served directly on a wide banana leaf on the table. No plates, only fragrant green leaves closing the distance between you and the food — a way of eating believed to enhance flavor and togetherness."}'::jsonb
  ),
  (
    'uniquenessFeature2',
    '{"title":"Nasi & Kuah Boleh Nambah","description":"Pramusaji berkeliling menyajikan nasi serta kuah sesuai porsi yang diinginkan pelanggan, menghadirkan kebersamaan di setiap meja."}'::jsonb,
    '{"title":"Unlimited Rice & Gravy","description":"Servers move around the tables serving rice and gravy according to each guest’s preference, making every meal feel shared."}'::jsonb
  ),
  (
    'uniquenessFeature3',
    '{"title":"Cocok untuk Keluarga & Rombongan","description":"Dengan kapasitas 260 kursi, tersedia area makan indoor, VIP Room, dan Meeting Room untuk keluarga maupun rombongan."}'::jsonb,
    '{"title":"Great for Families & Groups","description":"Long banana-leaf tables invite everyone to sit together. Ideal for family gatherings, office events, or groups of dozens."}'::jsonb
  ),
  (
    'uniquenessFeature4',
    '{"title":"Cita Rasa Nusantara","description":"Nikmati hidangan tradisional Indonesia dengan bahan segar dan resep tradisional dalam suasana autentik."}'::jsonb,
    '{"title":"Flavors of the Archipelago","description":"Enjoy traditional Indonesian dishes made with fresh ingredients and traditional recipes in an authentic atmosphere."}'::jsonb
  ),
  (
    'about',
    '{"sectionLabel":"Tentang Kami","sectionTitle":"Filosofi di balik daun pisang.","welcomeMessage":"Wilujeung sumping, mangga linggih.","founded":"15 April 2011","locationStory":"Kota Bandung","story":["Didirikan pada 15 April 2011 di Kota Bandung, Rumah Makan Alas Daun hadir sebagai destinasi kuliner yang menawarkan pengalaman makan khas Indonesia yang berbeda.","Berlokasi di Jalan Citarum No. 34, tepat di kawasan strategis Gedung Sate dan Gasibu Bandung, Alas Daun menempati bangunan berarsitektur kolonial yang menghadirkan suasana hangat dan autentik.","Nama “Alas Daun” dipilih sesuai dengan konsep utama yang diusung, yaitu menyajikan pengalaman makan menggunakan alas daun pisang sebagai pengganti piring."],"vision":"Menjadi restoran pilihan utama untuk menikmati hidangan tradisional Indonesia dengan suasana autentik.","mission":["Menyajikan makanan berkualitas dengan bahan-bahan segar dan resep tradisional.","Memberikan pelayanan terbaik dan ramah kepada setiap pelanggan.","Menciptakan suasana makan yang nyaman dan menyenangkan bagi keluarga dan semua kalangan."],"philosophy":["Kesederhanaan","Kerendahan hati","Ketulusan","Kebermanfaatan bagi banyak orang","Kebersamaan"],"tagline":"Sensasi Makan Tanpa Piring","diningDescription":"Setiap meja dialasi daun pisang segar dan pramusaji berkeliling menyajikan nasi serta kuah sesuai porsi yang diinginkan pelanggan.","milestones":["15 April 2011 – Rumah Makan Alas Daun resmi berdiri di Bandung.","2018 – Meraih penghargaan Restoran Terbaik pada Ajang Anugerah Pesona Pariwisata Kota Bandung.","2020 – Mendapatkan penghargaan Traveller’s Choice dari Tripadvisor.","Mendapatkan Sertifikasi CHSE."],"signatureDishes":["Ayam Seuhah","Barakuda Bakar Bambu","Tumis Bunga Pepaya","Ayam Sibuluh","Tutut Bumbu Kuning"],"signatureBeverages":["Es Karembong Kayas","Es Dawegan Sangkuriang","Bandrek","Es Cincau Tradisional"],"capacity":"260 Seats","areas":["Indoor Dining Area","VIP Room","Meeting Room"],"facilities":["Area Parkir Luas","Mushola","Toilet","WiFi","AC pada VIP Room dan Meeting Room","Kursi Bayi","Pembayaran Debit, Kredit dan QRIS","Reservasi","Catering Service","Delivery Service","GoFood, GrabFood dan ShopeeFood"],"videoUrl":"/vidaboutus/alasdaun.mp4","youtubeUrl":"https://youtu.be/Du9jdliX9Zk"}'::jsonb,
    '{"sectionLabel":"About Us","sectionTitle":"The philosophy behind the banana leaf.","welcomeMessage":"Welcome, please have a seat.","founded":"15 April 2011","locationStory":"Bandung","story":["Founded on 15 April 2011 in Bandung, Rumah Makan Alas Daun offers a distinctive Indonesian dining experience.","Located at Jalan Citarum No. 34, near Gedung Sate and Gasibu Bandung, Alas Daun occupies a colonial-style building with a warm and authentic atmosphere.","The name “Alas Daun” reflects our signature concept: dining on banana leaves instead of plates."],"vision":"To become the first choice for traditional Indonesian cuisine in an authentic atmosphere.","mission":["Serve quality food made with fresh ingredients and traditional recipes.","Provide the best, friendliest service to every guest.","Create a comfortable and enjoyable dining atmosphere for families and everyone."],"philosophy":["Simplicity","Humility","Sincerity","Being beneficial to others","Togetherness"],"tagline":"The No-Plate Dining Sensation","diningDescription":"Every table is covered with fresh banana leaves while servers bring rice and gravy according to each guest’s preference.","milestones":["15 April 2011 – Rumah Makan Alas Daun was founded in Bandung.","2018 – Received Best Restaurant recognition at the Bandung Tourism Awards.","2020 – Received Tripadvisor Traveller’s Choice.","Achieved CHSE certification."],"signatureDishes":["Ayam Seuhah","Barakuda Bakar Bambu","Tumis Bunga Pepaya","Ayam Sibuluh","Tutut Bumbu Kuning"],"signatureBeverages":["Es Karembong Kayas","Es Dawegan Sangkuriang","Bandrek","Traditional Grass Jelly"],"capacity":"260 seats","areas":["Indoor Dining Area","VIP Room","Meeting Room"],"facilities":["Large Parking Area","Prayer Room","Toilet","WiFi","AC in VIP and Meeting Rooms","Baby Chairs","Debit, Credit and QRIS Payments","Reservations","Catering Service","Delivery Service","GoFood, GrabFood and ShopeeFood"],"videoUrl":"/vidaboutus/alasdaun.mp4","youtubeUrl":"https://youtu.be/Du9jdliX9Zk"}'::jsonb
  )
ON CONFLICT (content_key) DO NOTHING;
