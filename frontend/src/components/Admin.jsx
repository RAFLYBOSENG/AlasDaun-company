import { useEffect, useState } from 'react';
import { ArrowLeft, Leaf, LogOut, Pencil, Plus, Trash2, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

const emptyMenu = {
  name: '',
  category: '',
  price: '',
  descriptionId: '',
  descriptionEn: '',
  image: '',
  isBestSeller: false,
  isNew: false,
  promo: '',
  sortOrder: 0,
  isActive: true,
};

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
        reject(new Error('File gambar tidak dapat dibaca.'));
        return;
      }
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('File gambar tidak dapat dibaca.'));
    reader.readAsDataURL(file);
  });
}

function priceLabel(value) {
  return `Rp ${Number(value).toLocaleString('id-ID')}`;
}

export function Admin() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyMenu);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    apiRequest('/api/auth/session')
      .then((result) => {
        if (result.authenticated) setAdmin({ email: result.email });
        setCheckingSession(false);
      })
      .catch((requestError) => {
        if (requestError.status !== 401) setError(requestError.message);
        setCheckingSession(false);
      });
  }, []);

  useEffect(() => {
    if (admin) loadItems();
  }, [admin]);

  async function loadItems() {
    setLoadingItems(true);
    setError('');
    try {
      const result = await apiRequest('/api/admin/menu');
      setItems(result.data);
      return true;
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.status === 401) setAdmin(null);
      return false;
    } finally {
      setLoadingItems(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: formData.get('email'),
          password: formData.get('password'),
        },
      });
      setAdmin({ email: result.email });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setError('');
    try {
      await apiRequest('/api/auth/logout', { method: 'POST', body: {} });
      setAdmin(null);
      setItems([]);
      setNotice('');
      setForm(emptyMenu);
      setSelectedImage(null);
      setPreviewUrl('');
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyMenu);
    setSelectedImage(null);
    setPreviewUrl('');
    setError('');
    setNotice('');
    setShowForm(true);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      ...item,
      price: String(item.price),
      promo: item.promo == null ? '' : String(item.promo),
    });
    setSelectedImage(null);
    setPreviewUrl(item.image);
    setError('');
    setNotice('');
    setShowForm(true);
  }

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleImageSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Pilih gambar berformat JPEG, PNG, WebP, atau GIF.');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 3 MB.');
      event.target.value = '';
      return;
    }
    setError('');
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function closeForm() {
    setShowForm(false);
    setSelectedImage(null);
    setPreviewUrl('');
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      let image = form.image;
      if (selectedImage) {
        const uploaded = await apiRequest('/api/admin/menu/image', {
          method: 'POST',
          body: {
            contentType: selectedImage.type,
            data: await readFileAsBase64(selectedImage),
          },
        });
        image = uploaded.data.image;
      }
      if (!image) throw new Error('Pilih foto menu terlebih dahulu.');
      const body = {
        ...form,
        image,
        price: Number(form.price),
        promo: form.promo === '' ? null : Number(form.promo),
        sortOrder: Number(form.sortOrder),
      };
      await apiRequest(editingId ? `/api/admin/menu/${editingId}` : '/api/admin/menu', {
        method: editingId ? 'PUT' : 'POST',
        body,
      });
      const refreshed = await loadItems();
      if (!refreshed) return;
      setShowForm(false);
      setForm(emptyMenu);
      setSelectedImage(null);
      setPreviewUrl('');
      setEditingId(null);
      setNotice(editingId ? 'Menu berhasil diperbarui.' : 'Menu berhasil ditambahkan.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus menu "${item.name}"?`)) return;
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/admin/menu/${item.id}`, { method: 'DELETE' });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setNotice('Menu berhasil dihapus.');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const inputClass = 'mt-1 w-full rounded-lg border border-daun-200 bg-white px-3 py-2.5 text-sm text-daun-800 outline-none focus:border-daun-500 focus:ring-2 focus:ring-daun-100';

  if (checkingSession) {
    return <main className="flex min-h-screen items-center justify-center bg-krem-50 font-body text-daun-700">Memeriksa sesi admin...</main>;
  }

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-krem-50 px-5 py-12">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <a href="/" className="mb-7 inline-flex items-center gap-2 font-heading text-xl font-bold text-daun-600">
            <Leaf size={22} /> Alas Daun
          </a>
          <h1 className="mb-2 font-heading text-2xl font-bold text-daun-700">Login Admin</h1>
          <p className="mb-6 text-sm text-daun-600">Masuk untuk mengelola daftar menu.</p>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <label className="mb-4 block text-sm font-medium text-daun-700">
            Email
            <input name="email" type="email" autoComplete="username" required maxLength={254} className={inputClass} />
          </label>
          <label className="mb-6 block text-sm font-medium text-daun-700">
            Password
            <input name="password" type="password" autoComplete="current-password" required maxLength={256} className={inputClass} />
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Memproses...' : 'Masuk'}
          </button>
          <a href="/" className="mt-5 block text-center text-sm text-daun-600 hover:underline">Kembali ke website</a>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-krem-50">
      <header className="border-b border-daun-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-heading text-xl font-bold text-daun-700">Alas Daun · Admin</p>
            <p className="text-sm text-daun-500">{admin.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-daun-600 hover:bg-daun-50">
              <ArrowLeft size={16} /> Website
            </a>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-daun-200 px-4 py-2 text-sm font-medium text-daun-600 hover:bg-daun-50">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-daun-700">Daftar Menu</h1>
            <p className="mt-1 text-sm text-daun-600">Tambah, ubah, dan hapus menu yang tampil di website.</p>
          </div>
          <button onClick={startCreate} className="btn-primary">
            <Plus size={18} /> Tambah menu
          </button>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

        {showForm && (
          <form onSubmit={handleSave} className="mb-8 rounded-2xl border border-daun-100 bg-white p-5 shadow-soft sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-daun-700">{editingId ? 'Ubah menu' : 'Tambah menu'}</h2>
              <button type="button" onClick={closeForm} aria-label="Tutup form" className="rounded-full p-2 text-daun-500 hover:bg-daun-50">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium text-daun-700">
                Nama menu
                <input name="name" value={form.name} onChange={updateField} required maxLength={120} className={inputClass} />
              </label>
              <label className="text-sm font-medium text-daun-700">
                Kategori (slug)
                <input name="category" value={form.category} onChange={updateField} required maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="paket-makanan" className={inputClass} />
              </label>
              <label className="text-sm font-medium text-daun-700">
                Harga (Rp)
                <input name="price" type="number" min="1" step="1" value={form.price} onChange={updateField} required className={inputClass} />
              </label>
              <div className="text-sm font-medium text-daun-700 sm:col-span-2 lg:col-span-3">
                <label htmlFor="menu-image">Foto menu</label>
                <input
                  id="menu-image"
                  name="menuImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-daun-50 file:px-4 file:py-2 file:font-medium file:text-daun-700`}
                />
                <p className="mt-1 text-xs font-normal text-daun-500">
                  JPEG, PNG, WebP, atau GIF · maksimal 3 MB. File disimpan di frontend/public/asset/images/menu.
                </p>
                {previewUrl && (
                  <img src={previewUrl} alt="Pratinjau foto menu" className="mt-3 h-40 w-56 rounded-xl border border-daun-100 object-cover" />
                )}
              </div>
              <label className="text-sm font-medium text-daun-700 sm:col-span-2 lg:col-span-3">
                Deskripsi Bahasa Indonesia
                <textarea name="descriptionId" value={form.descriptionId} onChange={updateField} required maxLength={1000} rows="3" className={inputClass} />
              </label>
              <label className="text-sm font-medium text-daun-700 sm:col-span-2 lg:col-span-3">
                Deskripsi Bahasa Inggris
                <textarea name="descriptionEn" value={form.descriptionEn} onChange={updateField} required maxLength={1000} rows="3" className={inputClass} />
              </label>
              <label className="text-sm font-medium text-daun-700">
                Promo (%), opsional
                <input name="promo" type="number" min="1" max="99" step="1" value={form.promo} onChange={updateField} className={inputClass} />
              </label>
              <label className="text-sm font-medium text-daun-700">
                Urutan tampil
                <input name="sortOrder" type="number" min="0" step="1" value={form.sortOrder} onChange={updateField} className={inputClass} />
              </label>
              {editingId && (
                <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-daun-700">
                  <input name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} className="h-4 w-4 accent-daun-500" />
                  Tampilkan di website
                </label>
              )}
            </div>
            <div className="my-5 flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm text-daun-700">
                <input name="isBestSeller" type="checkbox" checked={form.isBestSeller} onChange={updateField} className="h-4 w-4 accent-daun-500" />
                Best seller
              </label>
              <label className="flex items-center gap-2 text-sm text-daun-700">
                <input name="isNew" type="checkbox" checked={form.isNew} onChange={updateField} className="h-4 w-4 accent-daun-500" />
                Menu baru
              </label>
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Menyimpan...' : editingId ? 'Simpan perubahan' : 'Simpan menu'}
            </button>
          </form>
        )}

        {loadingItems ? <p className="py-12 text-center text-daun-600">Memuat daftar menu...</p> : items.length === 0 ? (
          <div className="rounded-2xl bg-white px-5 py-12 text-center text-daun-600 shadow-soft">Belum ada menu di database.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-daun-50 text-daun-700">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Menu</th>
                    <th className="px-5 py-3 font-semibold">Kategori</th>
                    <th className="px-5 py-3 font-semibold">Harga</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-daun-50">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-daun-800">{item.name}</p>
                        <p className="mt-1 text-xs text-daun-500">{item.isBestSeller ? 'Best seller · ' : ''}{item.isNew ? 'Menu baru · ' : ''}{item.isActive ? 'Aktif' : 'Disembunyikan'}</p>
                      </td>
                      <td className="px-5 py-4 text-daun-600">{item.category}</td>
                      <td className="px-5 py-4 text-daun-700">{priceLabel(item.price)}</td>
                      <td className="px-5 py-4 text-daun-600">{item.promo ? `Promo ${item.promo}%` : '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(item)} aria-label={`Ubah ${item.name}`} className="rounded-full p-2 text-daun-600 hover:bg-daun-50">
                            <Pencil size={17} />
                          </button>
                          <button onClick={() => handleDelete(item)} aria-label={`Hapus ${item.name}`} className="rounded-full p-2 text-red-600 hover:bg-red-50">
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
