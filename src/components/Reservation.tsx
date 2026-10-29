import { useState } from 'react';
import { CalendarCheck, CheckCircle2, Send, ArrowLeft, User, Phone, Calendar, Clock, Users, MapPin, StickyNote } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';
import { insertReservation, buildWhatsAppMessage, openWhatsApp, type Reservation } from '../lib/supabase';
import { restaurantInfo } from '../data/content';
import { getOpenHoursText } from '../lib/hours';

type Step = 'form' | 'summary' | 'success';

export function Reservation() {
  const { lang, dict } = useLang();
  const today = new Date().toISOString().split('T')[0];

  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<Reservation>({
    name: '', phone: '', date: today, time: '18:00', guests: 4, area: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const areasId = ['Lantai 1 (Umum)', 'Lantai 2 (Keluarga)', 'Pojok Rombongan', ' outdoor / Teras'];
  const areasEn = ['Ground Floor (General)', '2nd Floor (Family)', 'Group Corner', 'Outdoor / Terrace'];
  const areas = lang === 'id' ? areasId : areasEn;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = lang === 'id' ? 'Nama wajib diisi' : 'Name is required';
    if (!form.phone.trim()) {
      e.phone = lang === 'id' ? 'Nomor WhatsApp wajib diisi' : 'WhatsApp number is required';
    } else if (!/^[0-9+\s-]{8,15}$/.test(form.phone)) {
      e.phone = lang === 'id' ? 'Format nomor tidak valid' : 'Invalid number format';
    }
    if (!form.date) e.date = lang === 'id' ? 'Tanggal wajib diisi' : 'Date is required';
    else if (form.date < today) e.date = lang === 'id' ? 'Tanggal minimal hari ini' : 'Date must be today or later';
    if (!form.time) e.time = lang === 'id' ? 'Jam wajib dipilih' : 'Time is required';
    if (!form.guests || form.guests < 1) e.guests = lang === 'id' ? 'Minimal 1 orang' : 'At least 1 guest';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePreview = () => {
    if (validate()) setStep('summary');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setDbError(null);
    const { error } = await insertReservation(form);
    setSubmitting(false);
    if (error) {
      setDbError(error);
      return;
    }
    const message = buildWhatsAppMessage(form, lang);
    openWhatsApp(message);
    setStep('success');
  };

  const reset = () => {
    setForm({ name: '', phone: '', date: today, time: '18:00', guests: 4, area: '', notes: '' });
    setErrors({});
    setDbError(null);
    setStep('form');
  };

  const inputBase = "w-full rounded-xl border bg-white px-4 py-3 pl-11 font-body text-sm text-daun-700 outline-none transition focus:border-daun-500 focus:ring-2 focus:ring-daun-200";
  const labelBase = "mb-1.5 block font-body text-sm font-medium text-daun-700";
  const errorText = "mt-1 font-body text-xs text-red-500";

  return (
    <section id="reservasi" className="relative overflow-hidden bg-krem-50 py-20">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-daun-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.reservation.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.reservation.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500" />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card sm:p-10">
          {/* STEP: FORM */}
          {step === 'form' && (
            <div className="space-y-5">
              <div>
                <label className={labelBase}>{dict.reservation.name}</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-daun-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`${inputBase} ${errors.name ? 'border-red-400' : 'border-daun-200'}`}
                    placeholder={lang === 'id' ? 'Nama lengkap Anda' : 'Your full name'}
                  />
                </div>
                {errors.name && <p className={errorText}>{errors.name}</p>}
              </div>

              <div>
                <label className={labelBase}>{dict.reservation.phone}</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-daun-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`${inputBase} ${errors.phone ? 'border-red-400' : 'border-daun-200'}`}
                    placeholder="0812 xxxx xxxx"
                  />
                </div>
                {errors.phone && <p className={errorText}>{errors.phone}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelBase}>{dict.reservation.date}</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-daun-400 z-10" />
                    <input
                      type="date"
                      value={form.date}
                      min={today}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className={`${inputBase} ${errors.date ? 'border-red-400' : 'border-daun-200'}`}
                    />
                  </div>
                  {errors.date && <p className={errorText}>{errors.date}</p>}
                </div>
                <div>
                  <label className={labelBase}>{dict.reservation.time}</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-daun-400 z-10" />
                    <select
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className={`${inputBase} ${errors.time ? 'border-red-400' : 'border-daun-200'} appearance-none`}
                    >
                      {['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  {errors.time && <p className={errorText}>{errors.time}</p>}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelBase}>{dict.reservation.guests}</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-daun-400 z-10" />
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.guests}
                      onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) || 1 })}
                      className={`${inputBase} ${errors.guests ? 'border-red-400' : 'border-daun-200'}`}
                    />
                  </div>
                  {errors.guests && <p className={errorText}>{errors.guests}</p>}
                </div>
                <div>
                  <label className={labelBase}>{dict.reservation.area}</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-daun-400 z-10" />
                    <select
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      className={`${inputBase} border-daun-200 appearance-none`}
                    >
                      <option value="">{dict.reservation.areaDefault}</option>
                      {areas.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelBase}>{dict.reservation.notes}</label>
                <div className="relative">
                  <StickyNote size={16} className="absolute left-4 top-4 text-daun-400" />
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-daun-200 bg-white px-4 py-3 pl-11 font-body text-sm text-daun-700 outline-none transition focus:border-daun-500 focus:ring-2 focus:ring-daun-200"
                    placeholder={lang === 'id' ? 'Misal: acara ulang tahun, rombongan 15 orang, kursi roda, dll.' : 'e.g. birthday, group of 15, wheelchair access, etc.'}
                  />
                </div>
              </div>

              {dbError && <p className="rounded-lg bg-red-50 px-4 py-2 font-body text-sm text-red-600">{dbError}</p>}

              <button onClick={handlePreview} className="btn-primary w-full">
                <CalendarCheck size={18} /> {dict.reservation.submit}
              </button>
              <p className="text-center font-body text-xs text-daun-500/70">
                {getOpenHoursText(lang)}
              </p>
            </div>
          )}

          {/* STEP: SUMMARY */}
          {step === 'summary' && (
            <div className="animate-fade-in">
              <h3 className="mb-6 font-heading text-2xl font-bold text-daun-600">{dict.reservation.summary}</h3>
              <dl className="space-y-3 rounded-2xl bg-krem-50 p-6">
                <Row label={dict.reservation.name} value={form.name} />
                <Row label={dict.reservation.phone} value={form.phone} />
                <Row label={dict.reservation.date} value={form.date} />
                <Row label={dict.reservation.time} value={form.time} />
                <Row label={dict.reservation.guests} value={`${form.guests}`} />
                {form.area && <Row label={dict.reservation.area} value={form.area} />}
                {form.notes && <Row label={dict.reservation.notes} value={form.notes} />}
              </dl>
              <p className="mt-4 font-body text-xs text-daun-500/70">
                {lang === 'id'
                  ? 'Tekan konfirmasi untuk menyimpan reservasi dan melanjutkan ke WhatsApp.'
                  : 'Press confirm to save your reservation and continue to WhatsApp.'}
              </p>
              {dbError && <p className="mt-2 rounded-lg bg-red-50 px-4 py-2 font-body text-sm text-red-600">{dbError}</p>}
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep('form')} className="btn-outline flex-1">
                  <ArrowLeft size={18} /> {dict.reservation.cancel}
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-accent flex-1 disabled:opacity-60">
                  <Send size={18} /> {submitting ? '...' : dict.reservation.confirm}
                </button>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <div className="animate-fade-up py-8 text-center">
              <CheckCircle2 size={64} className="mx-auto mb-4 text-daun-500" />
              <h3 className="mb-2 font-heading text-2xl font-bold text-daun-600">{dict.reservation.success}</h3>
              <p className="mb-8 font-body text-sm text-daun-700/80">{dict.reservation.successDesc}</p>
              <button onClick={reset} className="btn-primary">
                {dict.reservation.newReservation}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-daun-100 pb-2 last:border-0">
      <dt className="font-body text-sm text-daun-500">{label}</dt>
      <dd className="text-right font-body text-sm font-medium text-daun-700">{value}</dd>
    </div>
  );
}
