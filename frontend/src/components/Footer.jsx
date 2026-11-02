import { Leaf, Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { restaurantInfo } from '../data/content';
export function Footer() {
    const { lang, dict } = useLang();
    const year = new Date().getFullYear();
    const quickLinks = [
        { href: '#beranda', label: dict.nav.home },
        { href: '#menu', label: dict.nav.menu },
        { href: '#tentang', label: dict.nav.about },
        { href: '#galeri', label: dict.nav.gallery },
        { href: '#lokasi', label: dict.nav.location },
    ];
    return (<footer id="kontak" className="bg-daun-900 text-krem-100">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-daun-500 text-krem-100">
                <Leaf size={20}/>
              </span>
              <span className="font-heading text-xl font-bold">Alas Daun</span>
            </div>
            <p className="mb-4 font-body text-sm leading-relaxed text-krem-100/70">
              {lang === 'id'
            ? 'Sensasi makan tanpa piring, beralaskan daun pisang, dengan cita rasa Nusantara di jantung Bandung.'
            : 'The no-plate dining sensation, on banana leaves, with archipelago flavors in the heart of Bandung.'}
            </p>
            <p className="font-heading text-base italic text-oranye-300">
              {lang === 'id' ? '"Wilujeung Sumping"' : '"Welcome"'}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 font-heading text-base font-bold text-krem-100">{dict.footer.quick}</h4>
            <ul className="grid grid-cols-2 gap-2">
              {quickLinks.map((l) => (<li key={l.href}>
                  <button onClick={() => document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' })} className="font-body text-sm text-krem-100/70 transition hover:text-oranye-300">
                    {l.label}
                  </button>
                </li>))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-heading text-base font-bold text-krem-100">{dict.footer.contact}</h4>
            <ul className="space-y-3 font-body text-sm text-krem-100/70">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-oranye-300"/>
                <span>{restaurantInfo.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-oranye-300"/>
                <a href={`tel:${restaurantInfo.phoneIntl}`} className="transition hover:text-oranye-300">{restaurantInfo.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-oranye-300"/>
                <a href={`mailto:${restaurantInfo.email}`} className="transition hover:text-oranye-300">{restaurantInfo.email}</a>
              </li>
            </ul>

            <h4 className="mb-3 mt-6 font-heading text-base font-bold text-krem-100">{dict.footer.follow}</h4>
            <div className="flex gap-3">
              <a href={`https://instagram.com/${restaurantInfo.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-daun-700 text-krem-100 transition hover:bg-oranye-500">
                <Instagram size={18}/>
              </a>
              <a href={`https://facebook.com/${restaurantInfo.facebook}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-daun-700 text-krem-100 transition hover:bg-oranye-500">
                <Facebook size={18}/>
              </a>
              <a href={`https://youtube.com/watch?v=${restaurantInfo.youtubeVideoId}`} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-full bg-daun-700 text-krem-100 transition hover:bg-oranye-500">
                <Youtube size={18}/>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-daun-800">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-center font-body text-xs text-krem-100/50">
            &copy; {year} Rumah Makan Alas Daun. {dict.footer.rights}.
          </p>
        </div>
      </div>
    </footer>);
}
