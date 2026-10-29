import type { Lang } from '../data/content';

export const t = {
  id: {
    nav: { home: 'Beranda', menu: 'Menu', about: 'Tentang', gallery: 'Galeri', reservation: 'Reservasi', location: 'Lokasi', contact: 'Kontak', reserve: 'Reservasi' },
    hero: { greeting: 'Wilujeung Sumping di Alas Daun', sit: 'Mangga Linggih', subtitle: 'Sensasi Makan Tanpa Piring', viewMenu: 'Lihat Menu', reserveNow: 'Reservasi Sekarang', open: 'Buka', closed: 'Tutup' },
    uniq: { title: 'Keunikan Alas Daun', subtitle: 'Bukan sekadar makan — ini adalah pengalaman.' },
    menu: { title: 'Menu Pilihan', subtitle: 'Setiap hidangan disajikan segar di atas daun pisang.', search: 'Cari menu...', all: 'Semua', price: 'Harga', bestSeller: 'Best Seller', baru: 'Menu Baru', promo: 'Promo' },
    video: { title: 'Profil Alas Daun', subtitle: 'Saksikan suasana makan beralas daun.' },
    about: { title: 'Tentang Kami', subtitle: 'Filosofi di balik daun pisang.' },
    gallery: { title: 'Galeri', subtitle: 'Momen-momen di Alas Daun.' },
    testimonials: { title: 'Kata Mereka', subtitle: 'Apa kata pelanggan kami.' },
    reservation: { title: 'Reservasi', subtitle: 'Amankan meja Anda untuk pengalaman tak terlupakan.', name: 'Nama Lengkap', phone: 'Nomor WhatsApp', date: 'Tanggal', time: 'Jam', guests: 'Jumlah Orang', area: 'Pilihan Area', notes: 'Catatan / Permintaan Khusus', submit: 'Kirim Reservasi', summary: 'Ringkasan Reservasi', confirm: 'Konfirmasi & Kirim WhatsApp', cancel: 'Batal', success: 'Reservasi Terkirim!', successDesc: 'Reservasi Anda telah tersimpan. Anda akan diarahkan ke WhatsApp untuk konfirmasi.', newReservation: 'Reservasi Baru', areaDefault: 'Pilih area (opsional)', select: 'Pilih...' },
    location: { title: 'Lokasi & Kontak', address: 'Alamat', hours: 'Jam Operasional', directions: 'Petunjuk Arah', call: 'Telepon' },
    footer: { quick: 'Tautan Cepat', contact: 'Kontak', follow: 'Ikuti Kami', rights: 'Hak Cipta' },
    chatbot: { name: 'Asisten Alas Daun', welcome: 'Wilujeung! Saya Asisten Alas Daun. Ada yang bisa saya bantu?', placeholder: 'Tulis pesan...', quickMenu: 'Lihat Menu', quickReserve: 'Reservasi', quickLocation: 'Lokasi', quickHours: 'Jam Buka', fallback: 'Maaf, untuk pertanyaan itu silakan hubungi kami langsung via WhatsApp atau telepon 022 723 1101. Sampai jumpa di Alas Daun!' },
    admin: { title: 'Admin Alas Daun', login: 'Masuk', email: 'Email', password: 'Kata Sandi', logout: 'Keluar', list: 'Daftar Reservasi', empty: 'Belum ada reservasi.', date: 'Tanggal', time: 'Jam', guests: 'Orang', phone: 'WhatsApp', notes: 'Catatan', status: 'Status', area: 'Area', created: 'Dibuat', back: 'Kembali ke Beranda' },
  },
  en: {
    nav: { home: 'Home', menu: 'Menu', about: 'About', gallery: 'Gallery', reservation: 'Reserve', location: 'Location', contact: 'Contact', reserve: 'Reserve' },
    hero: { greeting: 'Welcome to Alas Daun', sit: 'Please, Have a Seat', subtitle: 'The No-Plate Dining Sensation', viewMenu: 'View Menu', reserveNow: 'Reserve Now', open: 'Open', closed: 'Closed' },
    uniq: { title: 'What Makes Us Unique', subtitle: 'Not just a meal — an experience.' },
    menu: { title: 'Featured Menu', subtitle: 'Every dish served fresh on banana leaves.', search: 'Search menu...', all: 'All', price: 'Price', bestSeller: 'Best Seller', baru: 'New', promo: 'Promo' },
    video: { title: 'Alas Daun Profile', subtitle: 'Watch the banana-leaf dining experience.' },
    about: { title: 'About Us', subtitle: 'The philosophy behind the banana leaf.' },
    gallery: { title: 'Gallery', subtitle: 'Moments at Alas Daun.' },
    testimonials: { title: 'What They Say', subtitle: 'From our guests.' },
    reservation: { title: 'Reservation', subtitle: 'Secure your table for an unforgettable experience.', name: 'Full Name', phone: 'WhatsApp Number', date: 'Date', time: 'Time', guests: 'Number of Guests', area: 'Seating Area', notes: 'Notes / Special Requests', submit: 'Send Reservation', summary: 'Reservation Summary', confirm: 'Confirm & Send via WhatsApp', cancel: 'Cancel', success: 'Reservation Sent!', successDesc: 'Your reservation has been saved. You will be redirected to WhatsApp for confirmation.', newReservation: 'New Reservation', areaDefault: 'Choose area (optional)', select: 'Select...' },
    location: { title: 'Location & Contact', address: 'Address', hours: 'Operating Hours', directions: 'Get Directions', call: 'Call' },
    footer: { quick: 'Quick Links', contact: 'Contact', follow: 'Follow Us', rights: 'All Rights Reserved' },
    chatbot: { name: 'Alas Daun Assistant', welcome: 'Welcome! I am the Alas Daun Assistant. How can I help?', placeholder: 'Type a message...', quickMenu: 'View Menu', quickReserve: 'Reserve', quickLocation: 'Location', quickHours: 'Opening Hours', fallback: 'Sorry, for that question please contact us directly via WhatsApp or call 022 723 1101. See you at Alas Daun!' },
    admin: { title: 'Alas Daun Admin', login: 'Sign In', email: 'Email', password: 'Password', logout: 'Sign Out', list: 'Reservations List', empty: 'No reservations yet.', date: 'Date', time: 'Time', guests: 'Guests', phone: 'WhatsApp', notes: 'Notes', status: 'Status', area: 'Area', created: 'Created', back: 'Back to Home' },
  },
} as const;

export type Dict = typeof t[Lang];

export function getDict(lang: Lang): Dict {
  return t[lang];
}
