import { useState } from 'react';
import { useLang } from '../lib/language-context';
import { apiRequest } from '../lib/api';

export function Testimonials() {
    const { dict } = useLang();
    const [form, setForm] = useState({ name: '', rating: 5, text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    async function submitReview(event) {
        event.preventDefault();
        setSubmitting(true);
        setMessage('');
        try {
            const result = await apiRequest('/api/testimonials', {
                method: 'POST',
                body: form,
            });
            setForm({ name: '', rating: 5, text: '' });
            setMessage(result.message || 'Ulasan berhasil dikirim dan menunggu persetujuan.');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (<section id="testimoni" className="relative overflow-hidden bg-daun-700 py-20">
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-daun-600/40 blur-3xl"/>
      <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-oranye-500/20 blur-3xl"/>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-300">{dict.testimonials.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-krem-100 sm:text-4xl">{dict.testimonials.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        <div className="mb-10 overflow-hidden rounded-3xl bg-krem-100 p-3 shadow-xl sm:p-5">
          <div
            className="elfsight-app-82b6bdf1-0235-47f3-83af-78a86ec372eb"
            data-elfsight-app-lazy
            aria-label="Ulasan Alas Daun"
          />
        </div>

        <div className="mx-auto w-full max-w-3xl">
        <form onSubmit={submitReview} className="rounded-3xl bg-krem-100/10 p-6 ring-1 ring-krem-100/15 sm:p-8">
          <h3 className="font-heading text-2xl font-bold text-krem-100">Bagikan pengalaman Anda</h3>
          <p className="mt-1 text-sm text-krem-100/70">Ulasan akan diperiksa admin sebelum ditampilkan.</p>
          {message && <p role="status" className="mt-4 rounded-lg bg-krem-100/20 px-3 py-2 text-sm text-krem-100">{message}</p>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-krem-100">Nama
              <input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} maxLength={80} className="mt-1 w-full rounded-lg border-0 bg-white/90 px-3 py-2.5 text-daun-800 outline-none" />
            </label>
            <label className="text-sm font-medium text-krem-100">Rating
              <select name="rating" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} className="mt-1 w-full rounded-lg border-0 bg-white/90 px-3 py-2.5 text-daun-800 outline-none">
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} bintang</option>)}
              </select>
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium text-krem-100">Ulasan
            <textarea name="text" value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} required minLength={10} maxLength={1000} rows="4" className="mt-1 w-full rounded-lg border-0 bg-white/90 px-3 py-2.5 text-daun-800 outline-none" />
          </label>
          <button type="submit" disabled={submitting} className="btn-accent mt-5 disabled:opacity-60">{submitting ? 'Mengirim...' : 'Kirim ulasan'}</button>
        </form>
        </div>
      </div>
    </section>);
}
