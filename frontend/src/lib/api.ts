import { restaurantInfo } from '../data/content';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'alas-daun-admin-token';

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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body = await response.json() as { data?: T; error?: string; token?: string };
  if (!response.ok) throw new Error(body.error || 'Permintaan gagal');
  return (body.data ?? body) as T;
}

export async function insertReservation(r: Reservation): Promise<{ error: string | null }> {
  try {
    await request('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        name: r.name,
        phone: r.phone,
        date: r.date,
        time: r.time,
        guests: r.guests,
        area: r.area || null,
        notes: r.notes || null,
      }),
    });
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fetchReservations(): Promise<{ data: Reservation[] | null; error: string | null }> {
  try {
    const data = await request<Reservation[]>('/api/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ''}` },
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function login(email: string, password: string): Promise<void> {
  const result = await request<{ token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(TOKEN_KEY, result.token);
}

export function hasSession(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function buildWhatsAppMessage(r: Reservation, lang: 'id' | 'en'): string {
  if (lang === 'id') {
    return `*Reservasi Alas Daun*\n\nNama: ${r.name}\nNo. WhatsApp: ${r.phone}\nTanggal: ${r.date}\nJam: ${r.time}\nJumlah Orang: ${r.guests}\n${r.area ? `Area: ${r.area}\n` : ''}${r.notes ? `Catatan: ${r.notes}\n` : ''}\nMohon konfirmasi reservasi saya. Terima kasih!`;
  }
  return `*Alas Daun Reservation*\n\nName: ${r.name}\nWhatsApp: ${r.phone}\nDate: ${r.date}\nTime: ${r.time}\nGuests: ${r.guests}\n${r.area ? `Area: ${r.area}\n` : ''}${r.notes ? `Notes: ${r.notes}\n` : ''}\nPlease confirm my reservation. Thank you!`;
}

export function openWhatsApp(message: string) {
  window.open(`https://wa.me/${restaurantInfo.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}
