import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

const emptyItem = { type: 'image', src: '', alt: '', sortOrder: 0, isActive: true };
const inputClass = 'mt-1 w-full rounded-lg border border-daun-200 bg-white px-3 py-2.5 text-sm text-daun-800 outline-none focus:border-daun-500 focus:ring-2 focus:ring-daun-100';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result.includes(',')) {
        reject(new Error('File media tidak dapat dibaca.'));
        return;
      }
      resolve(reader.result.slice(reader.result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('File media tidak dapat dibaca.'));
    reader.readAsDataURL(file);
  });
}

export function GalleryAdmin({ onError, onNotice }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    const result = await apiRequest('/api/admin/gallery');
    setItems(result.data);
  }

  useEffect(() => {
    loadItems().catch((error) => onError(error.message));
  }, [onError]);

  useEffect(() => () => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyItem);
    setSelectedFile(null);
    setPreviewUrl('');
    setShowForm(true);
    onError('');
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ ...item, sortOrder: String(item.sortOrder) });
    setSelectedFile(null);
    setPreviewUrl(item.src);
    setShowForm(true);
    onError('');
  }

  function closeForm() {
    setShowForm(false);
    setSelectedFile(null);
    setPreviewUrl('');
  }

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function selectFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : '';
    if (!type || !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
      onError('Pilih foto JPEG, PNG, WebP, GIF atau video MP4, WebM, OGG.');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      onError('Ukuran foto atau video maksimal 3 MB.');
      event.target.value = '';
      return;
    }
    setForm((current) => ({ ...current, type }));
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    onError('');
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    onError('');
    onNotice('');
    try {
      let src = form.src;
      let type = form.type;
      if (selectedFile) {
        const uploaded = await apiRequest('/api/admin/gallery/media', {
          method: 'POST',
          body: { contentType: selectedFile.type, data: await readFileAsBase64(selectedFile) },
        });
        src = uploaded.data.src;
        type = uploaded.data.type;
      }
      if (!src) throw new Error('Pilih foto atau video terlebih dahulu.');
      const body = { ...form, type, src, sortOrder: Number(form.sortOrder) };
      await apiRequest(editingId ? `/api/admin/gallery/${editingId}` : '/api/admin/gallery', {
        method: editingId ? 'PUT' : 'POST',
        body,
      });
      await loadItems();
      closeForm();
      onNotice(editingId ? 'Media galeri berhasil diperbarui.' : 'Media galeri berhasil ditambahkan.');
    } catch (error) {
      onError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Hapus media "${item.alt}"?`)) return;
    onError('');
    onNotice('');
    try {
      await apiRequest(`/api/admin/gallery/${item.id}`, { method: 'DELETE' });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      onNotice('Media galeri berhasil dihapus.');
    } catch (error) {
      onError(error.message);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-daun-700">Galeri foto & video</h1>
          <p className="mt-1 text-sm text-daun-600">Tambah, ganti, atau hapus media yang tampil di galeri website.</p>
        </div>
        <button onClick={startCreate} className="btn-primary"><Plus size={18} /> Tambah media</button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-8 rounded-2xl border border-daun-100 bg-white p-5 shadow-soft sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-daun-700">{editingId ? 'Ubah media' : 'Tambah media'}</h2>
            <button type="button" onClick={closeForm} aria-label="Tutup form" className="rounded-full p-2 text-daun-500 hover:bg-daun-50"><X size={20} /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-daun-700">
              Foto atau video
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg" onChange={selectFile} className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-daun-50 file:px-4 file:py-2 file:font-medium file:text-daun-700`} />
              <span className="mt-1 block text-xs font-normal text-daun-500">Maksimal 3 MB. Video sebaiknya MP4/WebM.</span>
            </label>
            <label className="text-sm font-medium text-daun-700">
              Deskripsi media
              <input name="alt" value={form.alt} onChange={updateField} required maxLength={160} placeholder="Contoh: Suasana makan keluarga" className={inputClass} />
            </label>
            <label className="text-sm font-medium text-daun-700">
              Urutan tampil
              <input name="sortOrder" type="number" min="0" step="1" value={form.sortOrder} onChange={updateField} className={inputClass} />
            </label>
            {editingId && <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-daun-700"><input name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} className="h-4 w-4 accent-daun-500" /> Tampilkan di website</label>}
          </div>
          {previewUrl && (form.type === 'video' ? <video src={previewUrl} controls className="mt-4 h-40 w-64 rounded-xl border border-daun-100 object-cover" /> : <img src={previewUrl} alt="Pratinjau galeri" className="mt-4 h-40 w-64 rounded-xl border border-daun-100 object-cover" />)}
          <button type="submit" disabled={saving} className="btn-primary mt-5 disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan media'}</button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-daun-100 bg-white shadow-soft">
            {item.type === 'video' ? <video src={item.src} muted playsInline preload="metadata" className="h-40 w-full object-cover" /> : <img src={item.src} alt={item.alt} className="h-40 w-full object-cover" />}
            <div className="p-3">
              <p className="truncate text-sm font-medium text-daun-700">{item.alt}</p>
              <p className="mt-1 text-xs text-daun-500">{item.type === 'video' ? 'Video' : 'Foto'} · urutan {item.sortOrder}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEdit(item)} className="inline-flex items-center gap-1 rounded-full border border-daun-200 px-3 py-1.5 text-xs font-medium text-daun-600 hover:bg-daun-50"><Pencil size={14} /> Ubah</button>
                <button onClick={() => remove(item)} className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"><Trash2 size={14} /> Hapus</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
