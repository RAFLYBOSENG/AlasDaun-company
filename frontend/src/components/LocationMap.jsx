import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { useLang } from '../lib/language-context';
import { restaurantInfo } from '../data/content';
import { getOpenHoursText } from '../lib/hours';
const mapsEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.906963403112!2d107.6251484!3d-6.901729100000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7b48de20921%3A0xdcb37807c078ca1b!2sAlas%20Daun%20Restaurant!5e0!3m2!1sen!2sid!4v1792995004883!5m2!1sen!2sid';
const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Alas+Daun+Restaurant+Jl+Citarum+No+34+Bandung';
export function LocationMap() {
    const { lang, dict } = useLang();
    return (<section id="lokasi" className="bg-krem-100 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.location.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.location.title}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Map */}
          <div className="overflow-hidden rounded-3xl shadow-card">
            <iframe title="Lokasi Alas Daun" src={mapsEmbed} className="h-full min-h-[320px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-daun-500 text-krem-100">
                <MapPin size={22}/>
              </div>
              <div>
                <h3 className="mb-1 font-heading text-lg font-bold text-daun-700">{dict.location.address}</h3>
                <p className="font-body text-sm text-daun-700/80">{restaurantInfo.address}</p>
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-accent mt-3 inline-flex px-5 py-2 text-sm">
                  <Navigation size={16}/> {dict.location.directions}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-daun-500 text-krem-100">
                <Phone size={22}/>
              </div>
              <div>
                <h3 className="mb-1 font-heading text-lg font-bold text-daun-700">{dict.location.call}</h3>
                <a href={`tel:${restaurantInfo.phoneIntl}`} className="font-body text-sm text-daun-700/80 transition hover:text-daun-500">
                  {restaurantInfo.phone}
                </a>
                <p className="font-body text-sm text-daun-700/60">{restaurantInfo.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-daun-500 text-krem-100">
                <Clock size={22}/>
              </div>
              <div>
                <h3 className="mb-1 font-heading text-lg font-bold text-daun-700">{dict.location.hours}</h3>
                <p className="font-body text-sm text-daun-700/80">{getOpenHoursText(lang)}</p>
                {/* [jam buka: 10.00-21.00] placeholder jam operasional, ganti setelah dikonfirmasi */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);
}
