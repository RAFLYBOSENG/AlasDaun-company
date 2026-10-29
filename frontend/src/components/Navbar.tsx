import { useState, useEffect } from 'react';
import { Menu, X, Leaf } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

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

  const handleNav = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-krem-100/95 shadow-soft backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => handleNav('#beranda')} className="flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-daun-500 text-krem-100 transition ${scrolled ? '' : 'ring-2 ring-krem-100/40'}`}>
            <Leaf size={18} />
          </span>
          <span className={`font-heading text-lg font-bold leading-none ${scrolled ? 'text-daun-600' : 'text-daun-600'}`}>
            Alas Daun
          </span>
        </button>

        {/* Desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="rounded-full px-4 py-2 font-body text-sm font-medium text-daun-700 transition hover:bg-daun-50 hover:text-daun-600"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={toggle}
            className="ml-2 rounded-full border border-daun-300 px-3 py-1.5 font-body text-xs font-semibold text-daun-600 transition hover:bg-daun-50"
            aria-label="Toggle language"
          >
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
          <button
            onClick={() => handleNav('#reservasi')}
            className="btn-accent ml-3 px-5 py-2 text-sm"
          >
            {dict.nav.reserve}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-daun-600 lg:hidden"
          onClick={() => setOpen((p) => !p)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-daun-100 bg-krem-100/98 backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className="rounded-lg px-4 py-2.5 text-left font-body text-sm font-medium text-daun-700 transition hover:bg-daun-50"
              >
                {l.label}
              </button>
            ))}
            <div className="flex items-center gap-3 px-4 pt-2">
              <button
                onClick={toggle}
                className="rounded-full border border-daun-300 px-4 py-1.5 font-body text-xs font-semibold text-daun-600"
              >
                {lang === 'id' ? 'English' : 'Bahasa Indonesia'}
              </button>
              <button
                onClick={() => handleNav('#reservasi')}
                className="btn-accent flex-1 px-5 py-2 text-sm"
              >
                {dict.nav.reserve}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
