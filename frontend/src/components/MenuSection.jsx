import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Star, X } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { categoryLabels } from '../data/menu';
import { apiRequest } from '../lib/api';
export function MenuSection() {
    const { lang, dict } = useLang();
    const [active, setActive] = useState('all');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    useEffect(() => {
        let cancelled = false;
        apiRequest('/api/menu')
            .then((result) => {
                if (!cancelled) setMenuItems(result.data);
            })
            .catch((requestError) => {
                if (!cancelled) setError(requestError.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);
    const categoryName = (category) => {
        const label = categoryLabels[category];
        return label ? (lang === 'id' ? label.id : label.en) : category.replaceAll('-', ' ');
    };
    const categories = [...new Set(menuItems.map((item) => item.category))];
    const bestSellerItems = menuItems.filter((item) => item.isBestSeller);
    const filteredAll = useMemo(() => (
        menuItems.filter((item) => {
            if (active === 'best-seller') return item.isBestSeller;
            return active === 'all' || item.category === active;
        })
    ), [active, menuItems]);
    useEffect(() => {
        if (!selectedMenu && !showAll) return undefined;
        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                if (selectedMenu) setSelectedMenu(null);
                else setShowAll(false);
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [selectedMenu, showAll]);
    const displayedItems = menuItems.filter((item) => !item.isBestSeller).slice(0, 4);
    const formatPrice = (price) => `Rp ${price.toLocaleString('id-ID')}`;

    const renderMenuCard = (m, inGrid = false) => {
        const promoPrice = m.promo ? Math.round(m.price * (1 - m.promo / 100)) : null;
        return (
          <button
            type="button"
            key={m.id}
            onClick={() => setSelectedMenu(m)}
            aria-label={`${m.name} - ${lang === 'id' ? 'lihat detail menu' : 'view menu details'}`}
            className={`group flex ${inGrid ? 'w-full min-w-0' : 'w-72 flex-none'} transform-gpu flex-col overflow-hidden rounded-2xl border border-transparent bg-krem-50 text-left shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-oranye-300 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun-500 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none`}
          >
            <div className="relative h-36 w-full overflow-hidden">
              <img src={m.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"/>
              <div className="absolute inset-0 bg-gradient-to-t from-daun-900/50 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100"/>
              {(m.isBestSeller || m.isNew) && (
                <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 font-body text-xs font-semibold shadow-soft ${m.isBestSeller ? 'bg-oranye-500 text-white' : 'bg-daun-500 text-krem-100'}`}>
                  {m.isBestSeller && <Star size={12} fill="currentColor"/>}
                  {m.isBestSeller ? dict.menu.bestSeller : dict.menu.baru}
                </span>
              )}
              {m.promo && (
                <span className="absolute right-3 top-3 rounded-full bg-oranye-500 px-3 py-1 font-body text-xs font-bold text-white shadow-soft">
                  -{m.promo}%
                </span>
              )}
            </div>
            <div className="flex min-h-32 flex-1 flex-col p-4">
              <h3 className="mb-1.5 font-heading text-base font-bold text-daun-700 transition-colors duration-300 group-hover:text-oranye-600">{m.name}</h3>
              <p className="mb-3 line-clamp-2 flex-1 font-body text-xs leading-relaxed text-daun-800/70">
                {lang === 'id' ? m.descriptionId : m.descriptionEn}
              </p>
              <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col">
                  {promoPrice && (
                    <span className="font-body text-xs text-daun-500 line-through">{formatPrice(m.price)}</span>
                  )}
                  <span className={`font-heading text-base font-bold ${promoPrice ? 'text-oranye-600' : 'text-daun-600'}`}>
                    {formatPrice(promoPrice || m.price)}
                  </span>
                </div>
                <span className="rounded-full bg-daun-50 px-2.5 py-1 font-body text-xs font-medium text-daun-500">
                  {categoryName(m.category)}
                </span>
              </div>
            </div>
          </button>
        );
    };

    return (<section id="menu" className="bg-krem-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.menu.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.menu.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        {!loading && !error && bestSellerItems.length > 0 && (
          <div className="mb-12">
            <div className="mb-5 flex items-center justify-center gap-2">
              <Star size={18} fill="currentColor" className="text-oranye-500"/>
              <h3 className="font-heading text-2xl font-bold text-daun-700">
                {dict.menu.bestSeller}
              </h3>
            </div>
            <div
              aria-label={dict.menu.bestSeller}
              className="menu-horizontal-scroll flex snap-x snap-mandatory touch-pan-x gap-4 overflow-x-auto px-1 pb-4"
            >
              {bestSellerItems.map((item) => renderMenuCard(item))}
            </div>
          </div>
        )}

        {/* Menu cards */}
        {error ? (<p role="alert" className="py-10 text-center font-body text-red-700">{error}</p>) : loading ? (
            <p className="py-10 text-center font-body text-daun-500">Memuat daftar menu...</p>
        ) : menuItems.length === 0 ? (<p className="py-10 text-center font-body text-daun-500">Menu belum tersedia.</p>) : (<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="no-scrollbar col-span-full flex gap-4 overflow-x-auto px-1 pb-4">
              {displayedItems.map((item) => renderMenuCard(item))}
            </div>
            <div className="col-span-full mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="group btn-accent px-7 py-3.5 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5 sm:text-base"
              >
                {lang === 'id' ? 'Lihat menu lainnya' : 'View all menu'}
                <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1"/>
              </button>
            </div>
          </div>)}

      </div>
      {showAll && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-daun-900/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShowAll(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-menu-title"
            className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-krem-50 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-daun-100 px-5 py-4 sm:px-7">
              <h3 id="all-menu-title" className="font-heading text-xl font-bold text-daun-700 sm:text-2xl">
                {lang === 'id' ? 'Semua Menu' : 'All Menu'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAll(false)}
                aria-label={lang === 'id' ? 'Tutup semua menu' : 'Close all menu'}
                className="rounded-full p-2 text-daun-700 transition hover:bg-daun-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun-500"
              >
                <X size={20}/>
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-7">
              <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-2">
                {bestSellerItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActive('best-seller')}
                    aria-pressed={active === 'best-seller'}
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 font-body text-sm font-medium transition ${active === 'best-seller' ? 'bg-oranye-500 text-white shadow-soft' : 'bg-daun-50 text-daun-600 hover:bg-daun-100'}`}
                  >
                    <Star size={14} fill="currentColor"/>
                    {dict.menu.bestSeller}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActive('all')}
                  aria-pressed={active === 'all'}
                  className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-sm font-medium transition ${active === 'all' ? 'bg-daun-500 text-krem-100 shadow-soft' : 'bg-daun-50 text-daun-600 hover:bg-daun-100'}`}
                >
                  {dict.menu.all}
                </button>
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setActive(category)}
                    aria-pressed={active === category}
                    className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-sm font-medium transition ${active === category ? 'bg-daun-500 text-krem-100 shadow-soft' : 'bg-daun-50 text-daun-600 hover:bg-daun-100'}`}
                  >
                    {categoryName(category)}
                  </button>
                ))}
              </div>
              {filteredAll.length === 0 ? (
                <p className="py-10 text-center font-body text-daun-500">Menu belum tersedia.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredAll.map((item) => renderMenuCard(item, true))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
      {selectedMenu && createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-daun-900/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMenu(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-detail-title"
            className="relative my-auto flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-krem-50 shadow-2xl md:flex-row"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedMenu(null)}
              aria-label={lang === 'id' ? 'Tutup detail menu' : 'Close menu details'}
              className="absolute right-3 top-3 z-10 rounded-full bg-krem-50/95 p-2 text-daun-700 shadow-soft transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun-500"
            >
              <X size={20}/>
            </button>
            <div className="flex max-h-[40vh] w-full shrink-0 items-center justify-center bg-daun-900/5 md:max-h-[85vh] md:w-auto md:max-w-[60%]">
              <img src={selectedMenu.image} alt={selectedMenu.name} className="h-auto w-auto max-h-[40vh] max-w-full object-contain md:max-h-[85vh]"/>
            </div>
            <div className="flex min-h-0 flex-col overflow-y-auto p-6 sm:p-8 md:flex-1">
              <span className="mb-3 w-fit rounded-full bg-daun-50 px-3 py-1 font-body text-xs font-medium text-daun-600">
                {categoryName(selectedMenu.category)}
              </span>
              <h3 id="menu-detail-title" className="mb-4 font-heading text-2xl font-bold text-daun-700">
                {selectedMenu.name}
              </h3>
              <p className="mb-6 flex-1 font-body text-sm leading-relaxed text-daun-800/80">
                {lang === 'id' ? selectedMenu.descriptionId : selectedMenu.descriptionEn}
              </p>
              <div className="flex items-end gap-3">
                {selectedMenu.promo && (
                  <span className="font-body text-sm text-daun-500 line-through">{formatPrice(selectedMenu.price)}</span>
                )}
                <span className="font-heading text-xl font-bold text-oranye-600">
                  {formatPrice(selectedMenu.promo
                    ? Math.round(selectedMenu.price * (1 - selectedMenu.promo / 100))
                    : selectedMenu.price)}
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>);
}
