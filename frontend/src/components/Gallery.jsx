import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { galleryImages } from '../data/content';
export function Gallery() {
    const { dict } = useLang();
    const [lightbox, setLightbox] = useState(null);
    const close = useCallback(() => setLightbox(null), []);
    const next = useCallback(() => setLightbox((p) => (p === null ? null : (p + 1) % galleryImages.length)), []);
    const prev = useCallback(() => setLightbox((p) => (p === null ? null : (p - 1 + galleryImages.length) % galleryImages.length)), []);
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
    return (<section id="galeri" className="bg-krem-100 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.gallery.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.gallery.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        <div className="masonry-grid">
          {galleryImages.map((img, i) => (<button key={i} onClick={() => setLightbox(i)} className="masonry-item group block w-full overflow-hidden rounded-2xl bg-krem-50 shadow-soft transition-all duration-500 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-oranye-400">
              <img src={img.src} alt={img.alt} loading="lazy" className="w-full transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute inset-0 bg-daun-900/0 transition-colors duration-300 group-hover:bg-daun-900/20"/>
            </button>))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-daun-900/90 p-4 animate-fade-in" onClick={close}>
          <button className="absolute right-4 top-4 rounded-full bg-krem-100/20 p-2 text-krem-100 transition hover:bg-krem-100/30" onClick={close} aria-label="Close">
            <X size={24}/>
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-krem-100/20 px-4 py-3 text-2xl text-krem-100 transition hover:bg-krem-100/30" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">
            ‹
          </button>
          <figure className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={galleryImages[lightbox].src} alt={galleryImages[lightbox].alt} className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"/>
            <figcaption className="mt-3 text-center font-body text-sm text-krem-100/80">
              {galleryImages[lightbox].alt}
            </figcaption>
          </figure>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-krem-100/20 px-4 py-3 text-2xl text-krem-100 transition hover:bg-krem-100/30" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">
            ›
          </button>
        </div>)}
    </section>);
}
