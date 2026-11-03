import { useState, useEffect, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { testimonials as fallbackTestimonials } from '../data/content';
import { apiRequest } from '../lib/api';

function avatarFor(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=86A760&color=fff`;
}

export function Testimonials() {
    const { lang, dict } = useLang();
    const [items, setItems] = useState(fallbackTestimonials);
    const [idx, setIdx] = useState(0);
    const [form, setForm] = useState({ name: '', rating: 5, text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const count = items.length;
    const go = useCallback((n) => setIdx((current) => count ? (current + n + count) % count : 0), [count]);
    const next = useCallback(() => go(1), [go]);
    const prev = useCallback(() => go(-1), [go]);

    useEffect(() => {
        apiRequest('/api/testimonials')
            .then((result) => {
                if (result.data.length) setItems(result.data);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (idx >= count) setIdx(0);
        const interval = setInterval(next, 6000);
        return () => clearInterval(interval);
    }, [idx, count, next]);

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

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-300">{dict.testimonials.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-krem-100 sm:text-4xl">{dict.testimonials.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="lg:order-2">
        {count > 0 && <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
              {items.map((tst) => (<div key={tst.id} className="w-full flex-shrink-0 px-2">
                  <div className="mx-auto max-w-2xl rounded-3xl bg-krem-100/10 p-8 backdrop-blur-sm ring-1 ring-krem-100/15 sm:p-10">
                    <Quote size={36} className="mb-4 text-oranye-300"/>
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: tst.rating }).map((_, i) => <Star key={i} size={18} className="text-oranye-400" fill="currentColor"/>)}
                    </div>
                    <p className="mb-6 font-body text-base leading-relaxed text-krem-100/90 sm:text-lg">"{lang === 'id' ? tst.textId : (tst.textEn || tst.textId)}"</p>
                    <div className="flex items-center gap-3">
                      <img src={tst.avatar || avatarFor(tst.name)} alt={tst.name} loading="lazy" className="h-12 w-12 rounded-full object-cover ring-2 ring-oranye-300/40"/>
                      <div>
                        <p className="font-heading text-base font-bold text-krem-100">{tst.name}</p>
                        <p className="font-body text-xs text-krem-100/60">{lang === 'id' ? 'Pelanggan Alas Daun' : 'Alas Daun Guest'}</p>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>
          </div>
          <button onClick={prev} className="absolute -left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-krem-100/20 text-krem-100 transition hover:bg-krem-100/30 sm:-left-4" aria-label="Previous"><ChevronLeft size={20}/></button>
          <button onClick={next} className="absolute -right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-krem-100/20 text-krem-100 transition hover:bg-krem-100/30 sm:-right-4" aria-label="Next"><ChevronRight size={20}/></button>
        </div>}

        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-oranye-400' : 'w-2 bg-krem-100/30'}`} aria-label={`Slide ${i + 1}`}/>)}
        </div>
          </div>

        <form onSubmit={submitReview} className="mx-auto w-full max-w-2xl rounded-3xl bg-krem-100/10 p-6 ring-1 ring-krem-100/15 sm:p-8 lg:order-1 lg:mt-0">
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
