export const t = {
    id: {
        nav: { home: 'Beranda', menu: 'Menu', about: 'Tentang', gallery: 'Galeri', location: 'Lokasi', contact: 'Kontak' },
        hero: { greeting: 'Wilujeung Sumping di Alas Daun', sit: 'Mangga Linggih', subtitle: 'Sensasi Makan Tanpa Piring', viewMenu: 'Lihat Menu', open: 'Buka', closed: 'Tutup' },
        uniq: { title: 'Keunikan Alas Daun', subtitle: 'Bukan sekadar makan — ini adalah pengalaman.' },
        menu: { title: 'Menu Pilihan', subtitle: 'Setiap hidangan disajikan segar di atas daun pisang.', search: 'Cari menu...', all: 'Semua', price: 'Harga', bestSeller: 'Best Seller', baru: 'Menu Baru', promo: 'Promo' },
        video: { title: 'Profil Alas Daun', subtitle: 'Saksikan suasana makan beralas daun.' },
        about: { title: 'Tentang Kami', subtitle: 'Filosofi di balik daun pisang.' },
        gallery: { title: 'Galeri', subtitle: 'Momen-momen di Alas Daun.' },
        testimonials: { title: 'Kata Mereka', subtitle: 'Apa kata pelanggan kami.' },
        location: { title: 'Lokasi & Kontak', address: 'Alamat', hours: 'Jam Operasional', directions: 'Petunjuk Arah', call: 'Telepon' },
        footer: { quick: 'Tautan Cepat', contact: 'Kontak', follow: 'Ikuti Kami', rights: 'Hak Cipta' },
        chatbot: { name: 'Asisten Alas Daun', welcome: 'Wilujeung! Saya Asisten Alas Daun. Ada yang bisa saya bantu?', placeholder: 'Tulis pesan...', quickMenu: 'Lihat Menu', quickLocation: 'Lokasi', quickHours: 'Jam Buka', fallback: 'Maaf, untuk pertanyaan itu silakan hubungi kami langsung via WhatsApp atau telepon 022 723 1101. Sampai jumpa di Alas Daun!' },
    },
    en: {
        nav: { home: 'Home', menu: 'Menu', about: 'About', gallery: 'Gallery', location: 'Location', contact: 'Contact' },
        hero: { greeting: 'Welcome to Alas Daun', sit: 'Please, Have a Seat', subtitle: 'The No-Plate Dining Sensation', viewMenu: 'View Menu', open: 'Open', closed: 'Closed' },
        uniq: { title: 'What Makes Us Unique', subtitle: 'Not just a meal — an experience.' },
        menu: { title: 'Featured Menu', subtitle: 'Every dish served fresh on banana leaves.', search: 'Search menu...', all: 'All', price: 'Price', bestSeller: 'Best Seller', baru: 'New', promo: 'Promo' },
        video: { title: 'Alas Daun Profile', subtitle: 'Watch the banana-leaf dining experience.' },
        about: { title: 'About Us', subtitle: 'The philosophy behind the banana leaf.' },
        gallery: { title: 'Gallery', subtitle: 'Moments at Alas Daun.' },
        testimonials: { title: 'What They Say', subtitle: 'From our guests.' },
        location: { title: 'Location & Contact', address: 'Address', hours: 'Operating Hours', directions: 'Get Directions', call: 'Call' },
        footer: { quick: 'Quick Links', contact: 'Contact', follow: 'Follow Us', rights: 'All Rights Reserved' },
        chatbot: { name: 'Alas Daun Assistant', welcome: 'Welcome! I am the Alas Daun Assistant. How can I help?', placeholder: 'Type a message...', quickMenu: 'View Menu', quickLocation: 'Location', quickHours: 'Opening Hours', fallback: 'Sorry, for that question please contact us directly via WhatsApp or call 022 723 1101. See you at Alas Daun!' },
    },
};
export function getDict(lang) {
    return t[lang];
}
