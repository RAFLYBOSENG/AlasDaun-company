import { createClient } from '@supabase/supabase-js';
import { restaurantInfo } from '../data/content';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Reservation {
  id?: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  area?: string;
  notes?: string;
  status?: string;
  created_at?: string;
}

export async function insertReservation(r: Reservation): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reservations').insert({
    name: r.name,
    phone: r.phone,
    date: r.date,
    time: r.time,
    guests: r.guests,
    area: r.area || null,
    notes: r.notes || null,
    status: 'pending',
  });
  return { error: error ? error.message : null };
}

export async function fetchReservations(): Promise<{ data: Reservation[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data as Reservation[] | null, error: error ? error.message : null };
}

export function buildWhatsAppMessage(r: Reservation, lang: 'id' | 'en'): string {
  if (lang === 'id') {
    return (
      `*Reservasi Alas Daun*\n\n` +
      `Nama: ${r.name}\n` +
      `No. WhatsApp: ${r.phone}\n` +
      `Tanggal: ${r.date}\n` +
      `Jam: ${r.time}\n` +
      `Jumlah Orang: ${r.guests}\n` +
      (r.area ? `Area: ${r.area}\n` : '') +
      (r.notes ? `Catatan: ${r.notes}\n` : '') +
      `\nMohon konfirmasi reservasi saya. Terima kasih!`
    );
  }
  return (
    `*Alas Daun Reservation*\n\n` +
    `Name: ${r.name}\n` +
    `WhatsApp: ${r.phone}\n` +
    `Date: ${r.date}\n` +
    `Time: ${r.time}\n` +
    `Guests: ${r.guests}\n` +
    (r.area ? `Area: ${r.area}\n` : '') +
    (r.notes ? `Notes: ${r.notes}\n` : '') +
    `\nPlease confirm my reservation. Thank you!`
  );
}

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${restaurantInfo.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
