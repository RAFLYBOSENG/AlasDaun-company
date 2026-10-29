import { useState, useMemo } from 'react';
import { Search, Star } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';
import { menuItems, categoryLabels, type MenuCategory } from '../data/menu';
import { restaurantInfo } from '../data/content';

export function MenuSection() {
  const { lang, dict } = useLang();
  const [active, setActive] = useState<MenuCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const categories = Object.keys(categoryLabels) as MenuCategory[];

  const filtered = useMemo(() => {
    return menuItems.filter((m) => {
      const matchCat = active === 'all' || m.category === active;
      const q = query.trim().toLowerCase();
      const matchQuery = !q || m.name.toLowerCase().includes(q) || m.descriptionId.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [active, query]);

  return (
    <section id="menu" className="bg-krem-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.menu.title}</p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.menu.subtitle}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-oranye-500" />
        </div>

        {/* Search */}
        <div className="mx-auto mb-8 max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-daun-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.menu.search}
              className="w-full rounded-full border border-daun-200 bg-white py-3 pl-12 pr-4 font-body text-sm text-daun-700 shadow-soft outline-none transition focus:border-daun-500 focus:ring-2 focus:ring-daun-200"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="no-scrollbar mb-10 flex justify-start gap-2 overflow-x-auto pb-2 lg:justify-center">
          <button
            onClick={() => setActive('all')}
            className={`whitespace-nowrap rounded-full px-5 py-2 font-body text-sm font-medium transition ${
              active === 'all' ? 'bg-daun-500 text-krem-100 shadow-soft' : 'bg-white text-daun-600 hover:bg-daun-50'
            }`}
          >
            {dict.menu.all}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`whitespace-nowrap rounded-full px-5 py-2 font-body text-sm font-medium transition ${
                active === c ? 'bg-daun-500 text-krem-100 shadow-soft' : 'bg-white text-daun-600 hover:bg-daun-50'
              }`}
            >
              {lang === 'id' ? categoryLabels[c].id : categoryLabels[c].en}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="py-10 text-center font-body text-daun-500">—</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => {
              const promoPrice = m.promo ? Math.round(m.price * (1 - m.promo / 100)) : null;
              return (
                <article
                  key={m.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={m.image}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-daun-900/40 to-transparent" />
                    {m.badge && (
                      <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 font-body text-xs font-semibold shadow-soft ${
                        m.badge === 'Best Seller' ? 'bg-oranye-500 text-white' : 'bg-daun-500 text-krem-100'
                      }`}>
                        {m.badge === 'Best Seller' && <Star size={12} fill="currentColor" />}
                        {m.badge === 'Best Seller' ? dict.menu.bestSeller : dict.menu.baru}
                      </span>
                    )}
                    {m.promo && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 font-body text-xs font-bold text-white shadow-soft">
                        -{m.promo}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-1.5 font-heading text-lg font-bold text-daun-700">{m.name}</h3>
                    <p className="mb-4 flex-1 font-body text-sm leading-relaxed text-daun-800/70">
                      {lang === 'id' ? m.descriptionId : m.descriptionEn}
                    </p>
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        {promoPrice ? (
                          <>
                            <span className="font-body text-xs text-daun-500 line-through">
                              Rp {m.price.toLocaleString('id-ID')}
                            </span>
                            <span className="font-heading text-lg font-bold text-oranye-600">
                              Rp {promoPrice.toLocaleString('id-ID')}
                            </span>
                          </>
                        ) : (
                          <span className="font-heading text-lg font-bold text-daun-600">
                            Rp {m.price.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                      <span className="rounded-full bg-daun-50 px-3 py-1 font-body text-xs font-medium text-daun-500">
                        {lang === 'id' ? categoryLabels[m.category].id : categoryLabels[m.category].en}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center font-body text-sm text-daun-600/70">
          {lang === 'id'
            ? `Nasi & kuah boleh nambah. Harga dapat berubah sewaktu-waktu. Reservasi: ${restaurantInfo.phone}`
            : `Unlimited rice & gravy. Prices subject to change. Reservations: ${restaurantInfo.phone}`}
        </p>
      </div>
    </section>
  );
}
