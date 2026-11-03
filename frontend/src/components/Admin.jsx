import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowDown, ArrowUp, ArrowUpDown, Leaf, LogOut, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { GalleryAdmin } from './GalleryAdmin';

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

function categorySlug(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState({ key: 'sortOrder', direction: 'asc' });
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => (
    [...new Set(items.map((item) => item.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
  ), [items]);

  const visibleItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesSearch = !query || [
        item.name,
        item.category,
        String(item.price),
        priceLabel(item.price),
      ].some((value) => String(value).toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((first, second) => {
      let comparison = 0;
      if (sort.key === 'price') {
        comparison = Number(first.price) - Number(second.price);
      } else if (sort.key === 'sortOrder') {
        comparison = Number(first.sortOrder ?? 0) - Number(second.sortOrder ?? 0);
      } else {
        comparison = String(first[sort.key] ?? '').localeCompare(
          String(second[sort.key] ?? ''),
          'id',
          { numeric: true, sensitivity: 'base' },
        );
      }
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [items, categoryFilter, searchTerm, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / itemsPerPage));
  const pagedItems = visibleItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, itemsPerPage, sort]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  function changeSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  function sortIndicator(key) {
    if (sort.key !== key) return <ArrowUpDown size={14} className="text-daun-400" />;
    return sort.direction === 'asc'
      ? <ArrowUp size={14} className="text-daun-600" />
      : <ArrowDown size={14} className="text-daun-600" />;
  }

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!showForm) return undefined;
    function handleEscape(event) {
      if (event.key === 'Escape') closeForm();
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showForm]);

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
    setAddingCategory(false);
    setNewCategory('');
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
    setAddingCategory(false);
    setNewCategory('');
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
    setAddingCategory(false);
    setNewCategory('');
  }

  async function handleSave(event) {
    event.preventDefault();
    const finalCategory = categorySlug(addingCategory ? newCategory : form.category);
    if (!finalCategory) {
      setError('Isi kategori menu terlebih dahulu.');
      return;
    }
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
        category: finalCategory,
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

  async function updateQuickSetting(item, updates) {
    setError('');
    try {
      const result = await apiRequest(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        body: {
          ...item,
          ...updates,
          price: Number(item.price),
          promo: updates.promo === undefined ? item.promo : updates.promo,
          sortOrder: Number(item.sortOrder),
          isActive: item.isActive !== false,
        },
      });
      setItems((current) => current.map((entry) => (
        entry.id === item.id ? result.data : entry
      )));
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
      <main
        className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-krem-50 px-5 py-12"
      >
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
    <main
      className="min-h-screen w-full overflow-x-hidden bg-krem-50"
    >
      <header className="border-b border-daun-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5">
          <div>
            <p className="font-heading text-xl font-bold text-daun-700">Alas Daun · Admin</p>
            <p className="text-sm text-daun-500">{admin.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-daun-600 hover:bg-daun-50">
              <ArrowLeft size={16} /> Website
            </a>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-daun-200 px-4 py-2 text-sm font-medium text-daun-600 hover:bg-daun-50">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 sm:py-10">
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

        <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari menu</span>
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-daun-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama, kategori, atau harga menu..."
              className="w-full rounded-lg border border-daun-200 py-2.5 pl-10 pr-3 text-sm text-daun-800 outline-none focus:border-daun-500 focus:ring-2 focus:ring-daun-100"
            />
          </label>
          <label className="sm:w-64">
            <span className="sr-only">Filter kategori</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-lg border border-daun-200 bg-white px-3 py-2.5 text-sm text-daun-800 outline-none focus:border-daun-500 focus:ring-2 focus:ring-daun-100"
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          {(searchTerm || categoryFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
              }}
              className="rounded-lg border border-daun-200 px-4 py-2.5 text-sm font-medium text-daun-600 hover:bg-daun-50"
            >
              Reset
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-daun-600 sm:ml-auto">
            Tampilkan
            <select
              value={itemsPerPage}
              onChange={(event) => setItemsPerPage(Number(event.target.value))}
              className="rounded-lg border border-daun-200 bg-white px-3 py-2.5 text-sm text-daun-800 outline-none focus:border-daun-500 focus:ring-2 focus:ring-daun-100"
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            data
          </label>
        </div>

        {showForm && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-daun-900/50 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
          <form onSubmit={handleSave} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-daun-100 bg-white p-5 shadow-2xl sm:p-7">
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
              <div className="text-sm font-medium text-daun-700">
                Kategori
                <select
                  value={addingCategory ? '__new_category__' : form.category}
                  onChange={(event) => {
                    if (event.target.value === '__new_category__') {
                      setAddingCategory(true);
                      setNewCategory('');
                      return;
                    }
                    setAddingCategory(false);
                    setNewCategory('');
                    setForm((current) => ({ ...current, category: event.target.value }));
                  }}
                  required={!addingCategory}
                  className={inputClass}
                >
                  <option value="" disabled>Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="__new_category__">+ Tambah kategori</option>
                </select>
                {addingCategory && (
                  <div className="mt-2">
                    <input
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      required
                      maxLength={60}
                      placeholder="Contoh: Minuman Dingin"
                      className={inputClass}
                    />
                    <div className="mt-1 flex items-center justify-between gap-2 text-xs font-normal text-daun-500">
                      <span>Disimpan sebagai: {categorySlug(newCategory) || '-'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingCategory(false);
                          setNewCategory('');
                        }}
                        className="font-medium text-daun-600 hover:underline"
                      >
                        Pilih kategori lama
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                <input name="isNew" type="checkbox" checked={form.isNew} onChange={updateField} className="h-4 w-4 accent-daun-500" />
                Menu baru
              </label>
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Menyimpan...' : editingId ? 'Simpan perubahan' : 'Simpan menu'}
            </button>
          </form>
          </div>
        )}

        {loadingItems ? <p className="py-12 text-center text-daun-600">Memuat daftar menu...</p> : items.length === 0 ? (
          <div className="rounded-2xl bg-white px-5 py-12 text-center text-daun-600 shadow-soft">Belum ada menu di database.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
            <div className="w-full overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-daun-50 text-daun-700">
                  <tr>
                    <th className="px-2 py-3 font-semibold sm:px-5">Pengaturan</th>
                    <th className="px-5 py-3 font-semibold">
                      <button type="button" onClick={() => changeSort('name')} className="flex items-center gap-1 sm:gap-2">
                        Menu {sortIndicator('name')}
                      </button>
                    </th>
                    <th className="px-2 py-3 font-semibold sm:px-5">Foto</th>
                    <th className="px-5 py-3 font-semibold">
                      <button type="button" onClick={() => changeSort('category')} className="flex items-center gap-2">
                        Kategori {sortIndicator('category')}
                      </button>
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      <button type="button" onClick={() => changeSort('price')} className="flex items-center gap-2">
                        Harga {sortIndicator('price')}
                      </button>
                    </th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-daun-50">
                  {visibleItems.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-12 text-center text-daun-500">
                        Menu tidak ditemukan. Ubah kata pencarian atau filter kategori.
                      </td>
                    </tr>
                  )}
                  {pagedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-2 py-3 align-top sm:px-5 sm:py-4">
                        <div className="flex flex-col gap-2 overflow-hidden">
                          <label className="flex items-center gap-2 text-xs text-daun-700" title="Best seller">
                            <input
                              type="checkbox"
                              checked={Boolean(item.isBestSeller)}
                              onChange={(event) => updateQuickSetting(item, { isBestSeller: event.target.checked })}
                              className="h-4 w-4 accent-daun-500"
                            />
                            Best seller
                          </label>
                          <label className="flex items-center gap-2 text-xs text-daun-700" title="Menu baru">
                            <input
                              type="checkbox"
                              checked={Boolean(item.isNew)}
                              onChange={(event) => updateQuickSetting(item, { isNew: event.target.checked })}
                              className="h-4 w-4 accent-daun-500"
                            />
                            Menu baru
                          </label>
                          <label className="flex items-center gap-1 text-xs text-daun-700" title="Promo">
                            Promo
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={item.promo ?? ''}
                              onChange={(event) => {
                                const promo = event.target.value === '' ? null : Number(event.target.value);
                                setItems((current) => current.map((entry) => (
                                  entry.id === item.id ? { ...entry, promo } : entry
                                )));
                              }}
                              onBlur={(event) => {
                                const value = event.target.value === '' ? null : Number(event.target.value);
                                updateQuickSetting(item, { promo: value });
                              }}
                              className="w-14 rounded border border-daun-200 px-1 py-1 text-right outline-none focus:border-daun-500"
                            />
                            %
                          </label>
                        </div>
                      </td>
                      <td className="px-2 py-3 align-top sm:px-5 sm:py-4">
                        <p className="font-semibold text-daun-800">{item.name}</p>
                        <p className="mt-1 text-xs text-daun-500">{item.isBestSeller ? 'Best seller · ' : ''}{item.isNew ? 'Menu baru · ' : ''}{item.isActive ? 'Aktif' : 'Disembunyikan'}</p>
                      </td>
                      <td className="px-2 py-3 align-top sm:px-5 sm:py-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-20 rounded-lg border border-daun-100 object-cover"
                          />
                        ) : (
                          <span className="text-xs text-daun-400">Tidak ada foto</span>
                        )}
                      </td>
                      <td className="break-all px-2 py-3 text-daun-600 sm:px-5 sm:py-4">{item.category}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-daun-700 sm:px-5 sm:py-4">{priceLabel(item.price)}</td>
                      <td className="px-2 py-3 text-daun-600 sm:px-5 sm:py-4">{item.promo ? `Promo ${item.promo}%` : '—'}</td>
                      <td className="px-2 py-3 sm:px-5 sm:py-4">
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
            {visibleItems.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-daun-100 px-5 py-4 text-sm text-daun-600 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, visibleItems.length)} dari {visibleItems.length} menu
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-daun-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-2">Halaman {currentPage} dari {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-daun-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-12">
        <GalleryAdmin onError={setError} onNotice={setNotice} />
      </section>
    </main>
  );
}
