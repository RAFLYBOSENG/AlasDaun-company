import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, ChefHat, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { galleryImages } from '../data/content';
import { apiRequest } from '../lib/api';

const fallbackGallery = galleryImages.map((item, index) => ({
    id: `fallback-${index}`,
    category: index < 4 ? 'momen_di_alas_daun' : index < 8 ? 'tempat_di_alas_daun' : 'behind_the_scene',
    type: 'image',
    src: item.src,
    alt: item.alt,
}));
const normalizeCategory = (category) => ({
    moments: 'momen_di_alas_daun',
    place: 'tempat_di_alas_daun',
    facilities: 'behind_the_scene',
    'behind-scenes': 'behind_the_scene',
})[category] || category;
export function Gallery() {
    const { dict } = useLang();
    const [items, setItems] = useState(fallbackGallery);
    const [galleryModal, setGalleryModal] = useState(null);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [albumIndex, setAlbumIndex] = useState(0);
    const [albumDirection, setAlbumDirection] = useState('next');
    const [captionExpanded, setCaptionExpanded] = useState(false);
    const [needsCaptionExpansion, setNeedsCaptionExpansion] = useState(false);
    const captionRef = useRef(null);
    const swipeStartRef = useRef(null);
    const categories = [
        {
            id: 'momen_di_alas_daun',
            label: 'Momen di Alas Daun',
            eyebrow: 'Ceritanya di sini',
            description: 'Tawa, kebersamaan, dan pengalaman makan yang selalu terasa hangat.',
            icon: Camera,
        },
        {
            id: 'tempat_di_alas_daun',
            label: 'Pesona Ruangan',
            eyebrow: 'Kenali tempatnya',
            description: 'Sudut-sudut rumah makan yang nyaman, alami, dan penuh karakter.',
            icon: MapPin,
        },
        {
            id: 'behind_the_scene',
            label: 'Behind the Scene',
            eyebrow: 'Di balik rasa',
            description: 'Dapur, proses memasak, dan perjalanan bahan hingga sampai ke meja.',
            icon: ChefHat,
        },
    ];
    const modalCategory = categories.find((category) => category.id === galleryModal);
    const modalItems = galleryModal ? items.filter((item) => item.category === galleryModal && item.type !== 'video') : [];
    const activeAlbumItem = modalItems[albumIndex];
    useLayoutEffect(() => {
        const caption = captionRef.current;
        if (!caption)
            return;
        if (captionExpanded) {
            setNeedsCaptionExpansion(true);
            return;
        }
        setNeedsCaptionExpansion(caption.scrollHeight > caption.clientHeight + 1);
    }, [activeAlbumItem?.id, captionExpanded, galleryModal]);
    const openGallery = (category, currentPreviewIndex) => {
        const categoryItems = items.filter((item) => item.category === category && item.type !== 'video');
        const selectedIndex = categoryItems.length ? currentPreviewIndex % categoryItems.length : 0;
        setAlbumIndex(selectedIndex);
        setAlbumDirection('next');
        setCaptionExpanded(false);
        setGalleryModal(category);
    };
    const moveAlbum = (direction) => {
        if (!modalItems.length)
            return;
        setAlbumDirection(direction);
        setCaptionExpanded(false);
        const nextIndex = direction === 'next'
            ? (albumIndex + 1) % modalItems.length
            : (albumIndex - 1 + modalItems.length) % modalItems.length;
        setAlbumIndex(nextIndex);
    };
    const startSwipe = (event) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        swipeStartRef.current = {
            x: event.clientX,
            y: event.clientY,
        };
    };
    const endSwipe = (event) => {
        const start = swipeStartRef.current;
        swipeStartRef.current = null;
        if (!start)
            return;
        const offsetX = event.clientX - start.x;
        const offsetY = event.clientY - start.y;
        if (Math.abs(offsetX) < 40 || Math.abs(offsetX) <= Math.abs(offsetY))
            return;
        moveAlbum(offsetX < 0 ? 'next' : 'previous');
    };
    useEffect(() => {
        apiRequest('/api/gallery')
            .then((result) => {
                setItems(result.data.length
                    ? result.data.map((item) => ({
                        ...item,
                        category: normalizeCategory(item.category) || 'momen_di_alas_daun',
                    }))
                    : fallbackGallery);
            })
            .catch(() => {});
    }, []);
    useEffect(() => {
        if (!galleryModal)
            return;
        const onKey = (event) => {
            if (event.key === 'Escape') {
                setGalleryModal(null);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                moveAlbum('next');
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                moveAlbum('previous');
            }
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [galleryModal, modalItems.length, albumIndex]);
    useEffect(() => {
        const timer = window.setInterval(() => {
            setPreviewIndex((current) => current + 1);
        }, 2800);
        return () => window.clearInterval(timer);
    }, []);
    return (<section id="galeri" className="relative overflow-hidden bg-krem-100 py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-daun-200/20 blur-3xl"/>
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-oranye-200/20 blur-3xl"/>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.gallery.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.gallery.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
          <p className="mx-auto mt-5 max-w-2xl font-body text-daun-500">Setiap sudut menyimpan cerita. Pilih kategori dan jelajahi nuansa Alas Daun.</p>
        </div>

        <div className="mb-9 grid gap-3 md:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const previewItems = items.filter((item) => item.category === category.id && item.type !== 'video');
            const previewItem = previewItems.length ? previewItems[(previewIndex + index) % previewItems.length] : null;
            return <button key={category.id} type="button" onClick={() => openGallery(category.id, (previewIndex + index) % Math.max(previewItems.length, 1))} aria-label={`Buka galeri ${category.label}`} className="gallery-category-card group relative min-h-48 overflow-hidden rounded-2xl border border-daun-100 bg-white/80 text-daun-700 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-daun-600 hover:bg-daun-600 hover:text-white hover:shadow-card">
              <div className="gallery-category-preview relative overflow-hidden bg-daun-100">
                {previewItem && <img key={`${category.id}-${previewItem.id}-${previewIndex}`} src={previewItem.src} alt="" className="gallery-card-preview h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-daun-900/65 via-daun-900/10 to-transparent transition-colors duration-300 group-hover:from-daun-600/90"/>
                <div className="absolute bottom-3 left-4 flex gap-1.5">
                  {previewItems.slice(0, 4).map((item) => <span key={item.id} className={`h-1.5 rounded-full transition-all duration-300 ${previewItem?.id === item.id ? 'w-5 bg-white' : 'w-1.5 bg-white/55'}`}/>)}
                </div>
              </div>
              <span className="flex items-center gap-3 p-4 sm:p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-daun-50 text-daun-600 transition group-hover:bg-white group-hover:text-daun-600"><Icon size={20} strokeWidth={1.8}/></span>
                <span className="min-w-0">
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-oranye-500 transition group-hover:text-krem-200">{category.eyebrow}</span>
                  <span className="mt-1 block truncate font-heading text-lg font-bold leading-tight">{category.label}</span>
                </span>
              </span>
            </button>;
          })}
        </div>
      </div>

      {/* Gallery modal */}
      {galleryModal && createPortal(<div className="fixed inset-0 z-[90] flex h-[100dvh] items-center justify-center overflow-hidden bg-daun-900/80 p-2 backdrop-blur-sm animate-fade-in sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setGalleryModal(null); }}>
          <button type="button" onClick={() => setGalleryModal(null)} className="absolute right-3 top-3 z-30 rounded-full border border-white/20 bg-daun-900/70 p-2 text-white transition hover:bg-oranye-500 sm:right-5 sm:top-5 sm:p-2.5" aria-label="Tutup galeri"><X size={22}/></button>
          <div className="gallery-showcase-stage relative flex h-full w-full min-h-0 items-center justify-center overflow-y-auto overscroll-contain px-2 pb-5 pt-16 sm:px-16 sm:pb-8 sm:pt-8">
            {activeAlbumItem ? <>
              <button type="button" onClick={() => moveAlbum('previous')} className="absolute left-2 top-[42%] z-20 -translate-y-1/2 rounded-full bg-daun-900/75 p-2 text-white shadow-lg transition hover:bg-oranye-500 sm:left-4 sm:p-3 lg:left-6" aria-label="Foto sebelumnya"><ChevronLeft size={22}/><span className="sr-only">Foto sebelumnya</span></button>
              <div
                key={`${activeAlbumItem.id}-${albumIndex}`}
                className={`gallery-photo-slide gallery-photo-slide-${albumDirection}`}
                onPointerDown={startSwipe}
                onPointerUp={endSwipe}
                onPointerCancel={() => { swipeStartRef.current = null; }}
              >
                <div className="gallery-polaroid-frame mx-auto">
                  <img className="gallery-polaroid-photo" src={activeAlbumItem.src} alt={activeAlbumItem.alt}/>
                </div>
                <div className="gallery-photo-caption mt-4 mx-auto text-center text-white">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-oranye-500">{String(albumIndex + 1).padStart(2, '0')} / {String(modalItems.length).padStart(2, '0')}</span>
                  <p className="mt-1 font-body text-sm text-white sm:text-base">{activeAlbumItem.alt}</p>
                </div>
                <div className="mt-4 flex justify-center gap-1.5" aria-label="Posisi foto">
                  {modalItems.map((item, index) => <button key={item.id} type="button" onClick={() => { setAlbumDirection(index >= albumIndex ? 'next' : 'previous'); setAlbumIndex(index); }} aria-label={`Buka foto ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === albumIndex ? 'w-8 bg-oranye-500' : 'w-2 bg-daun-200 hover:bg-daun-400'}`} />)}
                </div>
              </div>
              <button type="button" onClick={() => moveAlbum('next')} className="absolute right-2 top-[42%] z-20 -translate-y-1/2 rounded-full bg-daun-900/75 p-2 text-white shadow-lg transition hover:bg-oranye-500 sm:right-4 sm:p-3 lg:right-6" aria-label="Foto berikutnya"><ChevronRight size={22}/><span className="sr-only">Foto berikutnya</span></button>
            </> : <p className="py-16 text-center text-daun-600">Belum ada foto pada kategori ini.</p>}
          </div>
      </div>, document.body)}
    </section>);
}
