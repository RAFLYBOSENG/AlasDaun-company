import { useLang } from '../lib/language-context';
export function About() {
    const { lang, dict } = useLang();
    return (<section id="tentang" className="bg-krem-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-3xl shadow-card">
              <img src="https://images.pexels.com/photos/37090679/pexels-photo-37090679.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Suasana rumah makan Alas Daun dengan hidangan di meja kayu" loading="lazy" className="h-full w-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-daun-900/40 to-transparent"/>
            </div>
            {/* Decorative leaf accent */}
            <div className="absolute -left-4 -top-4 -z-10 h-32 w-32 rounded-full bg-daun-200/40 blur-2xl"/>
            <div className="absolute -bottom-4 -right-4 -z-10 h-32 w-32 rounded-full bg-oranye-300/40 blur-2xl"/>
            {/* Stat badge */}
            <div className="absolute bottom-4 left-4 rounded-2xl bg-krem-100/95 px-5 py-3 shadow-soft backdrop-blur-sm">
              <p className="font-heading text-2xl font-bold text-daun-600">10.00 - 21.00</p>
              <p className="font-body text-xs text-daun-500">
                {lang === 'id' ? 'Buka setiap hari' : 'Open daily'}
              </p>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.about.title}</p>
            <h2 className="mb-6 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.about.subtitle}</h2>

            {lang === 'id' ? (<div className="space-y-4 font-body text-base leading-relaxed text-daun-800/85">
                <p>
                  Rumah Makan Alas Daun lahir dari kecintaan akan tradisi makan masyarakat Sunda. Di Bandung, kami menghidupkan kembali cara makan leluhur — beralaskan daun pisang lebar yang dibentang langsung di atas meja, tanpa piring.
                </p>
                <p>
                  Daun pisang bukan sekadar wadah; ia memberi aroma haraf yang menyatu dengan makanan, menjaga kehangatan, dan membuat suasana makan terasa lebih dekat. Pramusaji kami berkeliling menuangkan nasi hangat serta kuah cumi dan kuah rendang sebanyak yang Anda inginkan.
                </p>
                <p>
                  Kami percaya makan adalah urusan kebersamaan. Di Alas Daun, keluarga, teman, dan rombongan duduk berdampingan menikmati cita rasa Nusantara. <em className="font-heading text-oranye-600">Wilujeung sumping, mangga linggih.</em>
                </p>
              </div>) : (<div className="space-y-4 font-body text-base leading-relaxed text-daun-800/85">
                <p>
                  Alas Daun was born from a love of Sundanese dining tradition. In Bandung, we revive the ancestral way of eating — on a wide banana leaf spread directly on the table, without plates.
                </p>
                <p>
                  The banana leaf is more than a container; it imparts a fragrance that blends with the food, retains warmth, and makes the dining atmosphere feel closer. Our servers walk around pouring warm rice with squid gravy and rendang gravy as much as you desire.
                </p>
                <p>
                  We believe dining is about togetherness. At Alas Daun, family, friends, and groups sit side by side enjoying the flavors of the archipelago. <em className="font-heading text-oranye-600">Welcome, please have a seat.</em>
                </p>
              </div>)}
          </div>
        </div>
      </div>
      <div className="leaf-divider mt-16"/>
    </section>);
}
