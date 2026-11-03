import { useEffect, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

const statusLabels = { pending: 'Menunggu', approved: 'Tampil', rejected: 'Ditolak' };

export function TestimonialsAdmin({ onError, onNotice }) {
  const [items, setItems] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [keyword, setKeyword] = useState('');

  async function load() {
    const [reviews, blocked] = await Promise.all([
      apiRequest('/api/admin/testimonials'),
      apiRequest('/api/admin/testimonial-keywords'),
    ]);
    setItems(reviews.data);
    setKeywords(blocked.data);
  }

  useEffect(() => {
    load().catch((error) => onError(error.message));
  }, [onError]);

  async function setStatus(item, status) {
    onError('');
    try {
      await apiRequest(`/api/admin/testimonials/${item.id}`, { method: 'PUT', body: { status } });
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
      onNotice(`Ulasan berhasil ${status === 'approved' ? 'ditampilkan' : status === 'rejected' ? 'ditolak' : 'dikembalikan ke antrean'}.`);
    } catch (error) {
      onError(error.message);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Hapus ulasan dari ${item.name}?`)) return;
    try {
      await apiRequest(`/api/admin/testimonials/${item.id}`, { method: 'DELETE' });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      onNotice('Ulasan berhasil dihapus.');
    } catch (error) {
      onError(error.message);
    }
  }

  async function addKeyword(event) {
    event.preventDefault();
    try {
      const result = await apiRequest('/api/admin/testimonial-keywords', {
        method: 'POST',
        body: { keyword },
      });
      setKeywords((current) => [...current, result.data].sort((a, b) => a.keyword.localeCompare(b.keyword)));
      setKeyword('');
      onNotice('Keyword terlarang ditambahkan.');
    } catch (error) {
      onError(error.message);
    }
  }

  async function removeKeyword(item) {
    try {
      await apiRequest(`/api/admin/testimonial-keywords/${item.id}`, { method: 'DELETE' });
      setKeywords((current) => current.filter((entry) => entry.id !== item.id));
      onNotice('Keyword terlarang dihapus.');
    } catch (error) {
      onError(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-daun-700">Ulasan pelanggan</h1>
        <p className="mt-1 text-sm text-daun-600">Periksa ulasan sebelum ditampilkan di website.</p>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-daun-50 text-daun-700"><tr><th className="px-5 py-3">Pelanggan</th><th className="px-5 py-3">Ulasan</th><th className="px-5 py-3">Rating</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-daun-50">
              {items.map((item) => <tr key={item.id}>
                <td className="px-5 py-4 font-semibold text-daun-800">{item.name}</td>
                <td className="max-w-md px-5 py-4 text-daun-600">{item.textId}</td>
                <td className="px-5 py-4 text-oranye-500">{'★'.repeat(item.rating)}</td>
                <td className="px-5 py-4"><span className="rounded-full bg-daun-50 px-3 py-1 text-xs text-daun-700">{statusLabels[item.status]}</span></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-1">
                  {item.status !== 'approved' && <button onClick={() => setStatus(item, 'approved')} title="Tampilkan" className="rounded-full p-2 text-green-700 hover:bg-green-50"><Check size={17} /></button>}
                  {item.status !== 'rejected' && <button onClick={() => setStatus(item, 'rejected')} title="Tolak" className="rounded-full p-2 text-orange-700 hover:bg-orange-50"><X size={17} /></button>}
                  <button onClick={() => remove(item)} title="Hapus" className="rounded-full p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                </div></td>
              </tr>)}
              {!items.length && <tr><td colSpan="5" className="px-5 py-10 text-center text-daun-500">Belum ada ulasan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="font-heading text-xl font-bold text-daun-700">Keyword terlarang</h2>
        <p className="mt-1 text-sm text-daun-600">Ulasan yang mengandung keyword ini otomatis ditolak.</p>
        <form onSubmit={addKeyword} className="mt-4 flex max-w-lg gap-2">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} required minLength={2} maxLength={80} placeholder="Contoh: spam" className="w-full rounded-lg border border-daun-200 px-3 py-2.5 text-sm outline-none focus:border-daun-500" />
          <button type="submit" className="btn-primary whitespace-nowrap">Tambah</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {keywords.map((item) => <span key={item.id} className="inline-flex items-center gap-1 rounded-full bg-daun-50 px-3 py-1.5 text-sm text-daun-700">{item.keyword}<button onClick={() => removeKeyword(item)} aria-label={`Hapus keyword ${item.keyword}`}><X size={14} /></button></span>)}
        </div>
      </div>
    </div>
  );
}
