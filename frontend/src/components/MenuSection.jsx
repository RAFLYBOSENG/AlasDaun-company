import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, BadgePercent, Sparkles, Star, X } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { categoryLabels, subcategoryLabels } from '../data/menu';
import { apiRequest } from '../lib/api';

function MenuCategoryCard({ title, items, onClick, accent = false, staggerDelay = 0, badges = [] }) {
    const [imageOffset, setImageOffset] = useState(0);
    const [previousOffset, setPreviousOffset] = useState(0);
    const [rotationStarted, setRotationStarted] = useState(false);
    const images = items.map((item) => item.image).filter(Boolean);
    const collageDurationMs = 4000;

    useEffect(() => {
        if (images.length <= 4) return undefined;
        const startTimeout = window.setTimeout(() => setRotationStarted(true), staggerDelay);
        return () => window.clearTimeout(startTimeout);
    }, [images.length, staggerDelay]);

    useEffect(() => {
        if (!rotationStarted || images.length <= 4) return undefined;
        const interval = window.setInterval(() => {
            setImageOffset((current) => {
                setPreviousOffset(current);
                return (current + 1) % images.length;
            });
        }, collageDurationMs);
        return () => window.clearInterval(interval);
    }, [images.length, rotationStarted]);

    const visibleImages = Array.from({ length: 4 }, (_, index) => (
        images[(imageOffset + index) % images.length]
    ));

    return (
      <button
        type="button"
        onClick={onClick}
        className={`group relative isolate overflow-hidden rounded-3xl border text-left shadow-soft transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] motion-reduce:transform-none motion-reduce:transition-none ${
          accent
            ? 'border-oranye-200 bg-white hover:border-oranye-400 hover:shadow-[0_22px_55px_-18px_rgba(249,115,22,.48)]'
            : 'border-daun-100 bg-white hover:border-daun-400 hover:shadow-[0_22px_55px_-18px_rgba(22,101,52,.42)]'
        }`}
      >
        <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${accent ? 'bg-gradient-to-r from-amber-300 via-oranye-500 to-red-500' : 'bg-gradient-to-r from-daun-300 via-daun-500 to-emerald-400'}`} />
        <div className="relative grid h-56 grid-cols-2 grid-rows-2 gap-1 overflow-hidden bg-daun-100">
          <div className={`pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
            accent
              ? 'bg-gradient-to-tr from-oranye-900/35 via-transparent to-amber-200/25'
              : 'bg-gradient-to-tr from-daun-900/35 via-transparent to-emerald-200/20'
          }`} />
          {badges.length > 0 && (
            <div className="absolute left-0 top-0 z-10 flex flex-col items-start gap-1.5 pt-3">
              {badges.map((badge, index) => (
                <span
                  key={badge.label}
                  className={`relative inline-flex min-h-8 items-center gap-1.5 px-4 py-1.5 font-body text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_5px_12px_rgba(0,0,0,.22)] before:absolute before:left-0 before:top-full before:border-b-0 before:border-l-[8px] before:border-l-transparent before:border-t-[8px] ${badge.type === 'recommended' ? 'bg-gradient-to-r from-amber-500 to-oranye-500 before:border-t-amber-800' : 'bg-gradient-to-r from-red-600 to-rose-500 before:border-t-red-900'} ${index % 2 === 0 ? '-translate-x-1 -rotate-3' : '-translate-x-2 rotate-2'}`}
                  style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%)' }}
                >
                  {badge.type === 'recommended' ? <Star size={13} fill="currentColor" /> : <BadgePercent size={13} />}
                  {badge.label}
                </span>
              ))}
            </div>
          )}
          {visibleImages.map((image, index) => (
            <div key={index} className="relative h-full w-full overflow-hidden bg-daun-100">
              {previousOffset !== imageOffset && (
                <img
                  key={`previous-${previousOffset}-${index}`}
                  src={images[(previousOffset + index) % images.length]}
                  alt=""
                  className="menu-collage-fade-out absolute inset-0 h-full w-full object-cover"
                />
              )}
              <img
                key={`current-${imageOffset}-${index}`}
                src={image}
                alt=""
                loading="lazy"
                className="menu-collage-fade-in absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
        <div className="relative flex items-center justify-between gap-4 overflow-hidden p-5">
          <div className={`absolute bottom-0 left-0 h-full w-24 -translate-x-full skew-x-[-20deg] opacity-0 blur-sm transition-all duration-700 group-hover:translate-x-[420%] group-hover:opacity-25 ${
            accent ? 'bg-gradient-to-r from-transparent via-orange-300 to-transparent' : 'bg-gradient-to-r from-transparent via-emerald-300 to-transparent'
          }`} />
          <h3 className={`font-heading text-xl font-bold transition-colors duration-300 ${accent ? 'text-daun-700 group-hover:text-oranye-600' : 'text-daun-700 group-hover:text-daun-500'}`}>{title}</h3>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 ${
            accent ? 'bg-oranye-50 text-oranye-500 group-hover:bg-oranye-500 group-hover:text-white' : 'bg-daun-50 text-daun-500 group-hover:bg-daun-600 group-hover:text-white'
          }`}>
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </button>
    );
}

export function MenuSection() {
    const { lang, dict } = useLang();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [allCategory, setAllCategory] = useState('ala-carte');
    const [allSubcategory, setAllSubcategory] = useState('all');
    const [showFeatured, setShowFeatured] = useState(false);
    const [showPackages, setShowPackages] = useState(false);
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
    const subcategoryName = (subcategory) => {
        const label = subcategoryLabels[subcategory];
        return label ? (lang === 'id' ? label.id : label.en) : subcategory.replaceAll('-', ' ');
    };
    const featuredItems = menuItems.filter((item) => item.isRecommended || item.promo);
    const packageItems = menuItems.filter((item) => item.category === 'paketan');
    const alaCarteItems = menuItems.filter((item) => item.category === 'ala-carte');
    const drinkItems = menuItems.filter((item) => item.category === 'minuman');
    const dessertItems = menuItems.filter((item) => item.category === 'hidangan-penutup');
    const filteredAll = useMemo(() => (
        menuItems.filter((item) => {
            if (item.category === 'paketan') return false;
            return item.category === allCategory
                && (allSubcategory === 'all' || item.subcategory === allSubcategory);
        })
    ), [allCategory, allSubcategory, menuItems]);
    const availableSubcategories = [...new Set(
        menuItems
            .filter((item) => item.category === allCategory)
            .map((item) => item.subcategory)
            .filter(Boolean),
    )];
    useEffect(() => {
        if (!selectedMenu && !showAll && !showFeatured && !showPackages) return undefined;
        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                if (selectedMenu) setSelectedMenu(null);
                else if (showFeatured) setShowFeatured(false);
                else if (showPackages) setShowPackages(false);
                else setShowAll(false);
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [selectedMenu, showAll, showFeatured, showPackages]);
    const formatPrice = (price) => `Rp ${price.toLocaleString('id-ID')}`;

    const renderMenuCard = (m, inGrid = false) => {
        const promoPrice = m.promo ? Math.round(m.price * (1 - m.promo / 100)) : null;
        return (
          <button
            type="button"
            key={m.id}
            onClick={() => setSelectedMenu(m)}
            aria-label={`${m.name} - ${lang === 'id' ? 'lihat detail menu' : 'view menu details'}`}
            className={`group flex ${inGrid ? 'w-full min-w-0' : 'w-72 flex-none'} transform-gpu flex-col overflow-hidden rounded-2xl border bg-krem-50 text-left shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun-500 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none ${m.isRecommended ? 'border-oranye-300/80 hover:border-oranye-400' : m.promo ? 'border-red-300/70 hover:border-red-400' : 'border-transparent hover:border-oranye-300'}`}
          >
            <div className="relative h-36 w-full overflow-hidden">
              <img src={m.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"/>
              <div className="absolute inset-0 bg-gradient-to-t from-daun-900/50 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100"/>
              {(m.isRecommended || m.promo || m.isNew) && (
                <div className="absolute left-3 top-3 flex max-w-[calc(100%-24px)] flex-wrap gap-1.5">
                  {m.isRecommended && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-gradient-to-r from-oranye-500 to-amber-400 px-3 py-1.5 font-body text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(234,88,12,.35)] backdrop-blur-sm">
                      <Star size={12} fill="currentColor"/>
                      {dict.menu.recommended}
                    </span>
                  )}
                  {m.promo && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-gradient-to-r from-red-600 to-rose-500 px-3 py-1.5 font-body text-[11px] font-bold text-white shadow-[0_4px_14px_rgba(220,38,38,.35)] backdrop-blur-sm">
                      <BadgePercent size={13}/>
                      -{m.promo}%
                    </span>
                  )}
                  {m.isNew && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-daun-600/90 px-3 py-1 font-body text-xs font-semibold text-white shadow-soft backdrop-blur-sm">
                      <Sparkles size={12}/>
                      {dict.menu.baru}
                    </span>
                  )}
                </div>
              )}
                </div>
            <div className="flex min-h-32 flex-1 flex-col p-4">
              <h3 className="mb-1.5 font-heading text-base font-bold text-daun-700 transition-colors duration-300 group-hover:text-oranye-600">{m.name}</h3>
              <span className="mb-3 font-body text-xs font-medium text-daun-500">
                {categoryName(m.category)}
              </span>
              <p className="mb-3 line-clamp-2 flex-1 font-body text-xs leading-relaxed text-daun-800/70">
                {lang === 'id' ? m.descriptionId : m.descriptionEn}
              </p>
              <div className="flex items-end justify-between gap-2">
                <div className="flex items-center gap-2">
                  {promoPrice && (
                    <span className="font-body text-xs text-daun-500 line-through">{formatPrice(m.price)}</span>
                  )}
                  <span className={`font-heading text-base font-bold ${promoPrice ? 'text-oranye-600' : 'text-daun-600'}`}>
                    {formatPrice(promoPrice || m.price)}
                  </span>
                </div>
                {m.promo && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 px-2.5 py-1 font-body text-[11px] font-bold text-red-600 shadow-sm">
                    <BadgePercent size={12}/>
                    Hemat {m.promo}%
                  </span>
                )}
              </div>
            </div>
          </button>
        );
    };

    return (<section id="menu" className="bg-krem-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.menu.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.menu.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        {/* Menu cards */}
        {error ? (<p role="alert" className="py-10 text-center font-body text-red-700">{error}</p>) : loading ? (
            <p className="py-10 text-center font-body text-daun-500">Memuat daftar menu...</p>
        )         : menuItems.length === 0 ? (<p className="py-10 text-center font-body text-daun-500">Menu belum tersedia.</p>) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.length > 0 && (
              <MenuCategoryCard
                title="Recommended & Promo"
                items={featuredItems}
                onClick={() => setShowFeatured(true)}
                accent
                staggerDelay={0}
                badges={[
                  ...(featuredItems.some((item) => item.isRecommended) ? [{ type: 'recommended', label: dict.menu.recommended }] : []),
                  ...(featuredItems.some((item) => item.promo) ? [{ type: 'promo', label: 'Promo' }] : []),
                ]}
              />
            )}
            {packageItems.length > 0 && (
              <MenuCategoryCard title={lang === 'id' ? 'Menu Paketan' : 'Meal Packages'} items={packageItems} onClick={() => setShowPackages(true)} staggerDelay={1300} />
            )}
            {alaCarteItems.length > 0 && (
              <MenuCategoryCard title={lang === 'id' ? 'Menu Ala Carte' : 'A La Carte'} items={alaCarteItems} onClick={() => { setAllCategory('ala-carte'); setAllSubcategory('all'); setShowAll(true); }} staggerDelay={2600} />
            )}
            {drinkItems.length > 0 && (
              <MenuCategoryCard title={lang === 'id' ? 'Menu Minuman' : 'Beverages'} items={drinkItems} onClick={() => { setAllCategory('minuman'); setAllSubcategory('all'); setShowAll(true); }} staggerDelay={3900} />
            )}
            {dessertItems.length > 0 && (
              <MenuCategoryCard title={lang === 'id' ? 'Hidangan Penutup' : 'Desserts'} items={dessertItems} onClick={() => { setAllCategory('hidangan-penutup'); setAllSubcategory('all'); setShowAll(true); }} staggerDelay={5200} />
            )}
          </div>
        )}

      </div>
      {showPackages && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-daun-900/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShowPackages(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-menu-title"
            className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-krem-50 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-daun-100 px-5 py-4 sm:px-7">
              <h3 id="package-menu-title" className="font-heading text-xl font-bold text-daun-700 sm:text-2xl">
                {lang === 'id' ? 'Menu Paketan' : 'Meal Packages'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPackages(false)}
                aria-label={lang === 'id' ? 'Tutup menu paket' : 'Close meal package menu'}
                className="rounded-full p-2 text-daun-700 transition hover:bg-daun-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun-500"
              >
                <X size={20}/>
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {packageItems.map((item) => renderMenuCard(item, true))}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
      {showFeatured && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-daun-900/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShowFeatured(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="featured-menu-title"
            className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-krem-50 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-daun-100 px-5 py-4 sm:px-7">
              <h3 id="featured-menu-title" className="font-heading text-xl font-bold text-daun-700 sm:text-2xl">
                {lang === 'id' ? 'Recommended dan Promo' : 'Recommended and Promo'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFeatured(false)}
                aria-label={lang === 'id' ? 'Tutup menu Recommended dan Promo' : 'Close Recommended and Promo menu'}
                className="rounded-full p-2 text-daun-700 transition hover:bg-daun-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun-500"
              >
                <X size={20}/>
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredItems.map((item) => renderMenuCard(item, true))}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
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
                {categoryName(allCategory)}
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
                <button
                  type="button"
                  onClick={() => setAllSubcategory('all')}
                  aria-pressed={allSubcategory === 'all'}
                  className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-sm font-medium transition ${allSubcategory === 'all' ? 'bg-daun-500 text-krem-100 shadow-soft' : 'bg-daun-50 text-daun-600 hover:bg-daun-100'}`}
                >
                  {dict.menu.all}
                </button>
                {availableSubcategories.map((subcategory) => (
                  <button
                    type="button"
                    key={subcategory}
                    onClick={() => setAllSubcategory(subcategory)}
                    aria-pressed={allSubcategory === subcategory}
                    className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-sm font-medium transition ${allSubcategory === subcategory ? 'bg-daun-500 text-krem-100 shadow-soft' : 'bg-daun-50 text-daun-600 hover:bg-daun-100'}`}
                  >
                    {subcategoryName(subcategory)}
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
                {selectedMenu.promo && (
                  <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 font-body text-xs font-bold text-red-600 shadow-sm">
                    Hemat {selectedMenu.promo}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>);
}
