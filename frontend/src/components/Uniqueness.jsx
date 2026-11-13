import { Leaf, Infinity, Users, Globe2 } from 'lucide-react';
import { useLang } from '../lib/language-context';
export function Uniqueness() {
    const { lang, dict } = useLang();
    const features = [
        {
            icon: Leaf,
            titleId: 'Makan Tanpa Piring',
            titleEn: 'No-Plate Dining',
            descId: 'Setiap meja dialasi daun pisang segar sebagai pengganti piring, menghadirkan pengalaman makan tradisional yang autentik dan akrab.',
            descEn: 'Dishes are served directly on a wide banana leaf on the table. No plates, only fragrant green leaves closing the distance between you and the food — a way of eating believed to enhance flavor and togetherness.',
        },
        {
            icon: Infinity,
            titleId: 'Nasi & Kuah Boleh Nambah',
            titleEn: 'Unlimited Rice & Gravy',
            descId: 'Pramusaji berkeliling menyajikan nasi serta kuah sesuai porsi yang diinginkan pelanggan, menghadirkan kebersamaan di setiap meja.',
            descEn: 'Servers move around the tables serving rice and gravy according to each guest’s preference, making every meal feel shared.',
        },
        {
            icon: Users,
            titleId: 'Cicik intik Keluarga & Rombongan',
            titleEn: 'Great for Families & Groups',
            descId: 'Dengan kapasitas 260 kursi, tersedia area makan indoor, VIP Room, dan Meeting Room untuk keluarga maupun rombongan.',
            descEn: 'Long banana-leaf tables invite everyone to sit together. Ideal for family gatherings, office events, or groups of dozens.',
        },
        {
            icon: Globe2,
            titleId: 'Cita Rasa Nusantara',
            titleEn: 'Flavors of the Archipelago',
            descId: 'Nikmati hidangan tradisional Indonesia dengan bahan segar dan resep tradisional dalam suasana autentik.',
            descEn: 'Enjoy traditional Indonesian dishes made with fresh ingredients and traditional recipes in an authentic atmosphere.',
        },
    ];
    return (<section id="keunikan" className="bg-krem-100 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.uniq.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.uniq.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500"/>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (<div key={i} className="group relative overflow-hidden rounded-2xl bg-krem-50 p-7 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-daun-50 transition-transform duration-500 group-hover:scale-150"/>
                <div className="relative">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-daun-500 text-krem-100 shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon size={26}/>
                  </div>
                  <h3 className="mb-3 font-heading text-xl font-bold text-daun-700">
                    {lang === 'id' ? f.titleId : f.titleEn}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-daun-800/80">
                    {lang === 'id' ? f.descId : f.descEn}
                  </p>
                </div>
              </div>);
        })}
        </div>
      </div>
      <div className="leaf-divider mt-16"/>
    </section>);
}
