import { useState, useEffect } from 'react';
import { Menu, X, Leaf } from 'lucide-react';
import { useLang } from '../lib/language-context';
export function Navbar() {
    const { lang, dict, toggle } = useLang();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    const links = [
        { href: '#beranda', label: dict.nav.home },
        { href: '#menu', label: dict.nav.menu },
        { href: '#tentang', label: dict.nav.about },
        { href: '#galeri', label: dict.nav.gallery },
        { href: '#lokasi', label: dict.nav.location },
        { href: '#kontak', label: dict.nav.contact },
    ];
    const handleNav = (href) => {
        setOpen(false);
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    };
    const floatingControl = scrolled
        ? 'border border-daun-200/70 bg-krem-50/90 shadow-sm backdrop-blur-sm'
        : 'lg:border lg:border-krem-100/20 lg:bg-daun-900/35 lg:text-krem-50 lg:backdrop-blur-sm';
    return (<header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-krem-50 shadow-soft' : 'bg-krem-50 shadow-soft lg:bg-transparent lg:shadow-none'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => handleNav('#beranda')} className={`flex items-center gap-2 rounded-full transition ${scrolled ? 'bg-krem-50 py-1 pl-1 pr-3' : ''}`}>
          <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-daun-500 text-krem-100 transition ${scrolled ? '' : 'lg:ring-2 lg:ring-krem-100/40'}`}>
            <Leaf size={18}/>
          </span>
          <span className={`font-heading text-lg font-bold leading-none ${scrolled ? 'text-daun-600' : 'text-daun-600 lg:text-krem-50 lg:drop-shadow'}`}>
            Alas Daun
          </span>
        </button>

        {/* Desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (<button key={l.href} onClick={() => handleNav(l.href)} className={`rounded-full px-4 py-2 font-body text-sm font-medium transition ${scrolled ? 'text-daun-700 hover:bg-daun-100 hover:text-daun-600' : 'text-daun-700 hover:bg-daun-100 hover:text-daun-600 lg:text-krem-50 lg:hover:border-oranye-400 lg:hover:bg-oranye-500' } ${floatingControl}`}>
              {l.label}
            </button>))}
          <button onClick={toggle} className={`ml-2 rounded-full px-3 py-1.5 font-body text-xs font-semibold transition ${scrolled ? 'border border-daun-300 text-daun-600 hover:bg-daun-100' : 'border border-daun-300 text-daun-600 hover:bg-daun-100 lg:border-krem-100/20 lg:text-krem-50 lg:hover:border-oranye-400 lg:hover:bg-oranye-500'} ${floatingControl}`} aria-label="Toggle language">
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
          <a href="/admin" className="ml-2 rounded-full bg-oranye-500 px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-oranye-600">
            Admin
          </a>
        </div>

        {/* Mobile toggle */}
        <button className={`rounded-full p-2 transition lg:hidden ${scrolled ? 'text-daun-600 hover:bg-daun-100' : 'text-daun-600 hover:bg-daun-100 lg:text-krem-50 lg:hover:border-oranye-400 lg:hover:bg-oranye-500'} ${floatingControl}`} onClick={() => setOpen((p) => !p)} aria-label="Menu" aria-expanded={open} aria-controls="mobile-navigation">
          {open ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (<div id="mobile-navigation" className="border-t border-daun-100 bg-krem-50/98 shadow-soft backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {links.map((l) => (<button key={l.href} onClick={() => handleNav(l.href)} className="rounded-lg px-4 py-2.5 text-left font-body text-sm font-medium text-daun-700 transition hover:bg-daun-50">
                {l.label}
              </button>))}
            <div className="flex items-center gap-3 px-4 pt-2">
              <a href="/admin" onClick={() => setOpen(false)} className="rounded-full border border-oranye-500 px-4 py-1.5 font-body text-xs font-semibold text-oranye-600 transition hover:bg-oranye-500 hover:text-white">
                Admin
              </a>
              <button onClick={toggle} className="rounded-full border border-daun-300 px-4 py-1.5 font-body text-xs font-semibold text-daun-600">
                {lang === 'id' ? 'English' : 'Bahasa Indonesia'}
              </button>
            </div>
          </div>
        </div>)}
    </header>);
}
