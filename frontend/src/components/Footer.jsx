import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
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
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img src="/logo-alas-daun2.png" alt="Alas Daun" className="h-14 w-auto max-w-52 object-contain" />
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
            <ul className="grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-4 gap-y-2">
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
              {restaurantInfo.phone && <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-oranye-300"/>
                <a href={`tel:${restaurantInfo.phoneIntl}`} className="transition hover:text-oranye-300">{restaurantInfo.phone}</a>
              </li>}
              {restaurantInfo.email && <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-oranye-300"/>
                <a href={`mailto:${restaurantInfo.email}`} className="transition hover:text-oranye-300">{restaurantInfo.email}</a>
              </li>}
            </ul>

            {restaurantInfo.instagram || restaurantInfo.facebook || restaurantInfo.youtubeVideoId ? <h4 className="mb-3 mt-6 font-heading text-base font-bold text-krem-100">{dict.footer.follow}</h4> : null}
            <div className="flex gap-3">
              {restaurantInfo.instagram && <a href={`https://instagram.com/${restaurantInfo.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-daun-700 text-krem-100 transition hover:bg-oranye-500">
                <Instagram size={18}/>
              </a>}
              {restaurantInfo.facebook && <a href={`https://facebook.com/${restaurantInfo.facebook}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-daun-700 text-krem-100 transition hover:bg-oranye-500">
                <Facebook size={18}/>
              </a>}
              {restaurantInfo.youtubeVideoId && <a href={`https://youtube.com/watch?v=${restaurantInfo.youtubeVideoId}`} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-full bg-daun-700 text-krem-100 transition hover:bg-oranye-500">
                <Youtube size={18}/>
              </a>}
            </div>
            <a
              href="/links"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-oranye-300/30 px-3.5 py-2 font-body text-sm font-medium text-oranye-300 transition hover:border-oranye-300 hover:bg-oranye-500 hover:text-white"
            >
              Link In Bio <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-daun-800">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-center font-body text-xs text-krem-100/50">
            &copy; {year} Tim Developer OJT Alas Daun (Illyas &amp; Rafly). All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>);
}
