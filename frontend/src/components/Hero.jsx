import { useEffect, useState } from 'react';
import { UtensilsCrossed, Clock } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { isOpenNow } from '../lib/hours';
export function Hero() {
    const { dict } = useLang();
    const [open, setOpen] = useState(isOpenNow());
    useEffect(() => {
        const interval = setInterval(() => setOpen(isOpenNow()), 60000);
        return () => clearInterval(interval);
    }, []);
    const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    return (<section id="beranda" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src="https://images.pexels.com/photos/37303212/pexels-photo-37303212.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Hidangan Indonesia di atas daun pisang" className="h-full w-full object-cover" loading="eager" fetchpriority="high"/>
        <div className="absolute inset-0 bg-gradient-to-b from-daun-900/70 via-daun-800/55 to-daun-900/80"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(14,27,17,0.6)_100%)]"/>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center">
        {/* Open/Closed badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-krem-100/15 px-4 py-1.5 backdrop-blur-sm ring-1 ring-krem-100/30">
          <span className={`relative flex h-2.5 w-2.5`}>
            {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-daun-300 opacity-75"/>}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${open ? 'bg-daun-300' : 'bg-red-400'}`}/>
          </span>
          <span className="font-body text-sm font-medium text-krem-100">
            {open ? dict.hero.open : dict.hero.closed}
          </span>
          <Clock size={14} className="text-krem-100/70"/>
          {/* [jam buka: 10.00-21.00] placeholder jam operasional */}
        </div>

        {/* Sundanese greeting */}
        <p className="mb-3 font-heading text-lg italic text-oranye-300 animate-fade-in">{dict.hero.sit}</p>

        <h1 className="mb-4 font-heading text-4xl font-bold leading-tight text-krem-100 drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up">
          {dict.hero.greeting}
        </h1>

        <p className="mb-8 font-body text-lg font-light text-krem-100/90 sm:text-xl md:text-2xl animate-fade-up">
          {dict.hero.subtitle}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up">
          <button onClick={() => scrollTo('#menu')} className="btn-accent w-full sm:w-auto">
            <UtensilsCrossed size={18}/> {dict.hero.viewMenu}
          </button>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-krem-100 to-transparent"/>
    </section>);
}
