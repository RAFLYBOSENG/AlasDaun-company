import { useState, useEffect, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { testimonials } from '../data/content';
export function Testimonials() {
    const { lang, dict } = useLang();
    const [idx, setIdx] = useState(0);
    const count = testimonials.length;
    const go = useCallback((n) => setIdx((p) => (p + n + count) % count), [count]);
    const next = useCallback(() => go(1), [go]);
    const prev = useCallback(() => go(-1), [go]);
    useEffect(() => {
        const interval = setInterval(next, 6000);
        return () => clearInterval(interval);
    }, [next]);
    return (<section id="testimoni" className="relative overflow-hidden bg-daun-700 py-20">
      {/* decorative leaves */}
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-daun-600/40 blur-3xl"/>
      <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-oranye-500/20 blur-3xl"/>

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-300">{dict.testimonials.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-krem-100 sm:text-4xl">{dict.testimonials.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
              {testimonials.map((tst) => (<div key={tst.id} className="w-full flex-shrink-0 px-2">
                  <div className="mx-auto max-w-2xl rounded-3xl bg-krem-100/10 p-8 backdrop-blur-sm ring-1 ring-krem-100/15 sm:p-10">
                    <Quote size={36} className="mb-4 text-oranye-300"/>
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: tst.rating }).map((_, i) => (<Star key={i} size={18} className="text-oranye-400" fill="currentColor"/>))}
                    </div>
                    <p className="mb-6 font-body text-base leading-relaxed text-krem-100/90 sm:text-lg">
                      "{lang === 'id' ? tst.textId : tst.textEn}"
                    </p>
                    <div className="flex items-center gap-3">
                      <img src={tst.avatar} alt={tst.name} loading="lazy" className="h-12 w-12 rounded-full object-cover ring-2 ring-oranye-300/40"/>
                      <div>
                        <p className="font-heading text-base font-bold text-krem-100">{tst.name}</p>
                        <p className="font-body text-xs text-krem-100/60">
                          {lang === 'id' ? 'Pelanggan Alas Daun' : 'Alas Daun Guest'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>
          </div>

          {/* Controls */}
          <button onClick={prev} className="absolute -left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-krem-100/20 text-krem-100 transition hover:bg-krem-100/30 sm:-left-4" aria-label="Previous">
            <ChevronLeft size={20}/>
          </button>
          <button onClick={next} className="absolute -right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-krem-100/20 text-krem-100 transition hover:bg-krem-100/30 sm:-right-4" aria-label="Next">
            <ChevronRight size={20}/>
          </button>
        </div>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, i) => (<button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-oranye-400' : 'w-2 bg-krem-100/30'}`} aria-label={`Slide ${i + 1}`}/>))}
        </div>
      </div>
    </section>);
}
