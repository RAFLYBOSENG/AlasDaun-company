import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowDown, ArrowUp, ArrowUpDown, LogOut, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { GalleryAdmin } from './GalleryAdmin';
import { TestimonialsAdmin } from './TestimonialsAdmin';
import { MenuAdmin } from './MenuAdmin';

const emptyMenu = {
  name: '',
  category: '',
  price: '',
  descriptionId: '',
  descriptionEn: '',
  image: '',
  isRecommended: false,
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
  const [activeTab, setActiveTab] = useState('menu');
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
    setItems((current) => current.map((entry) => (
      entry.id === item.id ? { ...entry, ...updates } : entry
    )));
    try {
      const result = await apiRequest(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        body: {
          ...item,
          ...updates,
          price: Number(item.price),
          promo: updates.promo === undefined ? item.promo : updates.promo,
          sortOrder: Number(item.sortOrder),
        },
      });
      setItems((current) => current.map((entry) => (
        entry.id === item.id ? result.data : entry
      )));
    } catch (requestError) {
      setItems((current) => current.map((entry) => (
        entry.id === item.id ? item : entry
      )));
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
          <a href="/" className="mb-7 inline-flex items-center" aria-label="Alas Daun">
            <img src="/logo-alas-daun.png" alt="Alas Daun" className="h-14 w-auto object-contain" />
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
        <div className="mb-7 flex gap-2 rounded-xl bg-white p-1.5 shadow-soft" role="tablist" aria-label="Kelola website">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'menu'}
            onClick={() => setActiveTab('menu')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition sm:flex-none sm:px-6 ${activeTab === 'menu' ? 'bg-daun-600 text-white' : 'text-daun-600 hover:bg-daun-50'}`}
          >
            Kelola Menu
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'gallery'}
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition sm:flex-none sm:px-6 ${activeTab === 'gallery' ? 'bg-daun-600 text-white' : 'text-daun-600 hover:bg-daun-50'}`}
          >
            Kelola Galeri
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'testimonials'}
            onClick={() => setActiveTab('testimonials')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition sm:flex-none sm:px-6 ${activeTab === 'testimonials' ? 'bg-daun-600 text-white' : 'text-daun-600 hover:bg-daun-50'}`}
          >
            Kelola Ulasan
          </button>
        </div>

        {activeTab === 'menu' && <MenuAdmin />}

        {activeTab === 'gallery' && (
          <>
            {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {notice && <p role="status" className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
            <GalleryAdmin onError={setError} onNotice={setNotice} />
          </>
        )}
        {activeTab === 'testimonials' && (
          <>
            {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {notice && <p role="status" className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
            <TestimonialsAdmin onError={setError} onNotice={setNotice} />
          </>
        )}
      </section>
    </main>
  );
}
