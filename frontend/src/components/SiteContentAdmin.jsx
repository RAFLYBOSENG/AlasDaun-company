import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { apiRequest } from '../lib/api';

const emptyForm = {
  taglineId: '',
  taglineEn: '',
  philosophyId: '',
  philosophyEn: '',
};

function listToText(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function textToList(value) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

export function SiteContentAdmin() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const inputClass = 'mt-1 w-full rounded-lg border border-daun-200 bg-white px-3 py-2.5 text-sm text-daun-800 outline-none focus:border-daun-500 focus:ring-2 focus:ring-daun-100';

  useEffect(() => {
    apiRequest('/api/admin/content')
      .then(({ data }) => {
        setForm({
          taglineId: data.uniquenessTagline?.id || '',
          taglineEn: data.uniquenessTagline?.en || '',
          philosophyId: listToText(data.philosophy?.id),
          philosophyEn: listToText(data.philosophy?.en),
        });
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await apiRequest('/api/admin/content/uniquenessTagline', {
        method: 'PUT',
        body: { id: form.taglineId, en: form.taglineEn },
      });
      await apiRequest('/api/admin/content/philosophy', {
        method: 'PUT',
        body: {
          id: textToList(form.philosophyId),
          en: textToList(form.philosophyEn),
        },
      });
      setNotice('Tagline dan filosofi berhasil disimpan.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-12 text-center text-daun-600">Memuat konten situs...</p>;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-3xl font-bold text-daun-700">Konten Website</h1>
        <p className="mt-1 text-sm text-daun-600">Ubah tagline keunikan dan filosofi yang tampil di halaman utama.</p>
      </div>
      {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl bg-white p-5 shadow-soft sm:p-7">
        <section>
          <h2 className="font-heading text-xl font-bold text-daun-700">Tagline Keunikan Alas Daun</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-daun-700">
              Bahasa Indonesia
              <textarea name="taglineId" value={form.taglineId} onChange={updateField} maxLength={500} required rows="3" className={inputClass} />
            </label>
            <label className="text-sm font-medium text-daun-700">
              Bahasa Inggris
              <textarea name="taglineEn" value={form.taglineEn} onChange={updateField} maxLength={500} required rows="3" className={inputClass} />
            </label>
          </div>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold text-daun-700">Filosofi Alas Daun</h2>
          <p className="mt-1 text-xs text-daun-500">Satu filosofi per baris.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-daun-700">
              Bahasa Indonesia
              <textarea name="philosophyId" value={form.philosophyId} onChange={updateField} maxLength={3600} required rows="7" className={inputClass} />
            </label>
            <label className="text-sm font-medium text-daun-700">
              Bahasa Inggris
              <textarea name="philosophyEn" value={form.philosophyEn} onChange={updateField} maxLength={3600} required rows="7" className={inputClass} />
            </label>
          </div>
        </section>
        <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          <Save size={18} />
          {saving ? 'Menyimpan...' : 'Simpan konten'}
        </button>
      </form>
    </div>
  );
}
