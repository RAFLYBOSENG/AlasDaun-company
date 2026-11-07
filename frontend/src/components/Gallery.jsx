import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { galleryImages } from '../data/content';
import { apiRequest } from '../lib/api';

const ITEMS_PER_PAGE = 11;
const AUTO_ADVANCE_INTERVAL = 5000;

const fallbackGallery = galleryImages.map((item, index) => ({
    id: `fallback-${index}`,
    category: 'moments',
    type: 'image',
    src: item.src,
    alt: item.alt,
}));
export function Gallery() {
    const { dict } = useLang();
    const [items, setItems] = useState(fallbackGallery);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [galleryPage, setGalleryPage] = useState(0);
    const [transitionDirection, setTransitionDirection] = useState('next');
    const [lightbox, setLightbox] = useState(null);
    const [isTouchingGallery, setIsTouchingGallery] = useState(false);
    const touchStart = useRef(null);
    const categories = [
        { id: 'moments', label: 'Momen di Alas Daun' },
        { id: 'place', label: 'Tempat & Restoran' },
        { id: 'facilities', label: 'Fasilitas' },
    ];
    const activeCategory = categories[categoryIndex];
    const visibleItems = items.filter((item) => item.category === activeCategory.id);
    const totalPages = Math.ceil(visibleItems.length / ITEMS_PER_PAGE);
    const displayedItems = visibleItems.slice(
        galleryPage * ITEMS_PER_PAGE,
        (galleryPage + 1) * ITEMS_PER_PAGE,
    );
    const close = useCallback(() => setLightbox(null), []);
    const next = useCallback(() => setLightbox((p) => (p === null || !displayedItems.length ? null : (p + 1) % displayedItems.length)), [displayedItems.length]);
    const prev = useCallback(() => setLightbox((p) => (p === null || !displayedItems.length ? null : (p - 1 + displayedItems.length) % displayedItems.length)), [displayedItems.length]);
    const changeCategory = (direction) => {
        setCategoryIndex((current) => (current + direction + categories.length) % categories.length);
        setGalleryPage(0);
        setLightbox(null);
    };
    useEffect(() => {
        apiRequest('/api/gallery')
            .then((result) => {
                setItems(result.data.length
                    ? result.data.map((item) => ({ ...item, category: item.category || 'moments' }))
                    : fallbackGallery);
                setGalleryPage(0);
            })
            .catch(() => {});
    }, []);
    useEffect(() => {
        setLightbox(null);
    }, [categoryIndex]);
    useEffect(() => {
        if (galleryPage >= totalPages && totalPages > 0)
            setGalleryPage(totalPages - 1);
    }, [galleryPage, totalPages]);
    useEffect(() => {
        if (totalPages <= 1 || lightbox !== null || isTouchingGallery)
            return undefined;
        const advanceGallery = () => {
            if (document.visibilityState !== 'visible')
                return;
            setTransitionDirection('next');
            setGalleryPage((current) => (current + 1) % totalPages);
            setLightbox(null);
        };
        const timer = window.setInterval(advanceGallery, AUTO_ADVANCE_INTERVAL);
        return () => window.clearInterval(timer);
    }, [totalPages, lightbox, isTouchingGallery]);
    useEffect(() => {
        if (lightbox === null)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                close();
            if (e.key === 'ArrowRight')
                next();
            if (e.key === 'ArrowLeft')
                prev();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightbox, close, next, prev]);
    const handleTouchStart = (event) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
        setIsTouchingGallery(true);
    };
    const handleTouchEnd = (event) => {
        const start = touchStart.current;
        const touch = event.changedTouches[0];
        touchStart.current = null;
        setIsTouchingGallery(false);
        if (!start || !touch)
            return;
        const distanceX = touch.clientX - start.x;
        const distanceY = touch.clientY - start.y;
        if (Math.abs(distanceX) < 50 || Math.abs(distanceX) <= Math.abs(distanceY))
            return;
        changeCategory(distanceX < 0 ? 1 : -1);
    };
    const handleTouchCancel = () => {
        touchStart.current = null;
        setIsTouchingGallery(false);
    };
    return (<section
      id="galeri"
      className="gallery-swipe-surface bg-krem-100 py-20"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.gallery.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.gallery.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          <button type="button" onClick={() => changeCategory(-1)} aria-label="Kategori sebelumnya" className="rounded-full border-2 border-daun-400 px-4 py-2 text-2xl leading-none text-daun-600 transition hover:bg-daun-500 hover:text-white">‹</button>
          <div className="min-w-0 flex-1 text-center sm:min-w-52 sm:flex-none">
            <p className="font-heading text-2xl font-bold text-daun-700">{activeCategory.label}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-daun-500">{categoryIndex + 1} / {categories.length}</p>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-daun-400 sm:hidden">Geser untuk melihat kategori</p>
          </div>
          <button type="button" onClick={() => changeCategory(1)} aria-label="Kategori berikutnya" className="rounded-full border-2 border-daun-400 px-4 py-2 text-2xl leading-none text-daun-600 transition hover:bg-daun-500 hover:text-white">›</button>
        </div>

        <div key={`${activeCategory.id}-${galleryPage}`} className={`masonry-grid gallery-page-transition gallery-page-transition-${transitionDirection}`}>
          {displayedItems.length ? displayedItems.map((item, i) => (<button key={item.id} style={{ '--gallery-item-index': i }} onClick={() => setLightbox(i)} className="masonry-item gallery-item-reveal group relative block w-full overflow-hidden rounded-2xl bg-krem-50 shadow-soft transition-all duration-300 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-oranye-400">
              {item.type === 'video' ? <video src={item.src} aria-label={item.alt} muted playsInline preload="metadata" className="w-full transition-transform duration-700 group-hover:scale-105" /> : <img src={item.src} alt={item.alt} loading="lazy" className="w-full transition-transform duration-700 group-hover:scale-105"/>}
              {item.type === 'video' && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-daun-900/70 p-3 text-white"><Play size={22} fill="currentColor" /></span>}
              <div className="absolute inset-0 bg-daun-900/0 transition-colors duration-300 group-hover:bg-daun-900/20"/>
            </button>)) : <p className="col-span-full py-12 text-center text-daun-600">Belum ada media pada kategori ini.</p>}
        </div>
        {totalPages > 1 && <div className="mt-7 flex justify-center gap-2" aria-label="Indikator halaman galeri">
          {Array.from({ length: totalPages }, (_, index) => <span key={index} className={`h-1.5 rounded-full transition-all duration-500 ${index === galleryPage ? 'w-8 bg-oranye-500' : 'w-1.5 bg-daun-300'}`} />)}
        </div>}
      </div>

      {/* Lightbox */}
      {lightbox !== null && createPortal(<div className="fixed inset-0 z-[100] flex min-h-0 items-center justify-center overflow-y-auto bg-daun-900/90 p-2 animate-fade-in sm:p-4" onClick={close}>
          <button className="absolute right-2 top-2 rounded-full bg-krem-100/20 p-2 text-krem-100 transition hover:bg-krem-100/30 sm:right-4 sm:top-4" onClick={close} aria-label="Close">
            <X size={24}/>
          </button>
          <button className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-krem-100/20 px-3 py-2 text-2xl text-krem-100 transition hover:bg-krem-100/30 sm:left-4 sm:px-4 sm:py-3" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">
            ‹
          </button>
          <figure className="flex max-h-full min-h-0 w-full max-w-5xl flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {displayedItems[lightbox]?.type === 'video' ? <video src={displayedItems[lightbox].src} controls autoPlay playsInline className="block max-h-[calc(100dvh-7rem)] max-w-[calc(100vw-2rem)] rounded-xl object-contain shadow-2xl sm:max-h-[calc(100dvh-6rem)] sm:max-w-[calc(100vw-8rem)]" /> : <img src={displayedItems[lightbox]?.src} alt={displayedItems[lightbox]?.alt} className="block max-h-[calc(100dvh-7rem)] max-w-[calc(100vw-2rem)] rounded-xl object-contain shadow-2xl sm:max-h-[calc(100dvh-6rem)] sm:max-w-[calc(100vw-8rem)]"/>}
            <figcaption className="mt-3 max-w-full truncate px-10 text-center font-body text-sm text-krem-100/80">
              {displayedItems[lightbox]?.alt}
            </figcaption>
          </figure>
          <button className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-krem-100/20 px-3 py-2 text-2xl text-krem-100 transition hover:bg-krem-100/30 sm:right-4 sm:px-4 sm:py-3" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">
            ›
          </button>
        </div>, document.body)}
    </section>);
}
