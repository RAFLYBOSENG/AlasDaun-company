import {
  Bike,
  Facebook,
  Globe2,
  Instagram,
  Leaf,
  MessageCircle,
  Search,
  ShoppingBag,
  Youtube,
} from 'lucide-react';
import { restaurantInfo } from '../data/content';

const websiteUrl = 'https://www.alasdaun.com';

const contactLinks = [
  { label: 'WhatsApp Marketing Lina', icon: MessageCircle, href: '' },
  { label: 'WhatsApp Informasi', icon: MessageCircle, href: '' },
];

const deliveryLinks = [
  { label: 'GoFood', icon: Bike, href: '' },
  { label: 'GrabFood', icon: Bike, href: '' },
  { label: 'ShopeeFood', icon: ShoppingBag, href: '' },
];

function LinkButton({ href, icon: Icon, label, featured = false }) {
  const className = `group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full px-6 ${
    featured ? 'py-4 font-semibold' : 'py-3.5 font-medium'
  } bg-daun-700 text-krem-100 shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-oranye-500 hover:shadow-lg ${
    href ? '' : 'cursor-not-allowed opacity-60'
  }`;

  const content = (
    <>
      {featured && (
        <span className="absolute inset-0 translate-y-full bg-krem-50/15 transition-transform duration-300 group-hover:translate-y-0" />
      )}
      <Icon
        size={featured ? 21 : 22}
        className="relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-110"
        aria-hidden="true"
      />
      <span className="relative z-10">{label}</span>
    </>
  );

  if (!href) {
    return (
      <button
        type="button"
        disabled
        title="Tautan akan ditambahkan"
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  );
}

function SectionHeading({ children }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="h-px flex-1 bg-daun-300/60" />
      <h2 className="px-1 font-heading text-lg font-semibold italic text-daun-700">
        {children}
      </h2>
      <span className="h-px flex-1 bg-daun-300/60" />
    </div>
  );
}

export function LinkInBio() {
  const socialLinks = [
    {
      label: 'Facebook',
      icon: Facebook,
      href: `https://facebook.com/${restaurantInfo.facebook}`,
    },
    {
      label: 'Instagram',
      icon: Instagram,
      href: `https://instagram.com/${restaurantInfo.instagram}`,
    },
    { label: 'YouTube', icon: Youtube, href: '' },
    {
      label: 'Google',
      icon: Search,
      href: `https://www.google.com/search?q=${encodeURIComponent(restaurantInfo.mapsQuery)}`,
    },
    { label: 'Website', icon: Globe2, href: websiteUrl },
  ];

  return (
    <div className="relative isolate flex min-h-screen justify-center overflow-hidden bg-krem-100 font-body text-daun-700 selection:bg-oranye-500 selection:text-white">
      <div
        className="fixed inset-0 -z-20 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop')",
        }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10 bg-krem-50/90 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-daun-300/30 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-24 -right-20 -z-10 h-72 w-72 rounded-full bg-oranye-400/20 blur-[80px]"
        aria-hidden="true"
      />

      <main className="z-0 flex w-full max-w-md flex-col items-center px-6 py-10">
        <header className="mb-8 flex w-full flex-col items-center text-center">
          <div className="group relative mb-4">
            <img
              src="https://images.unsplash.com/photo-1549488344-c5a45293297a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              alt="Hidangan Alas Daun"
              className="h-28 w-28 rounded-full border-4 border-daun-700 object-cover shadow-xl transition duration-500 group-hover:rotate-3 group-hover:scale-105"
            />
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-krem-50 bg-oranye-500 text-white shadow-md">
              <Leaf size={16} aria-hidden="true" />
            </span>
          </div>
          <h1 className="mb-1 font-heading text-3xl font-bold tracking-wide text-daun-700">
            Alas Daun
          </h1>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-daun-500">
            Wilujeng Sumping
          </p>
        </header>

        <section className="mb-8 w-full" aria-label="Website resmi">
          <LinkButton
            href={websiteUrl}
            icon={Globe2}
            label="Kunjungi Website Kami"
            featured
          />
        </section>

        <section className="mb-8 w-full" aria-labelledby="contact-links-heading">
          <SectionHeading>
            <span id="contact-links-heading">Informasi &amp; Kontak</span>
          </SectionHeading>
          <div className="flex flex-col gap-3">
            {contactLinks.map((link) => (
              <LinkButton key={link.label} {...link} />
            ))}
          </div>
        </section>

        <section className="mb-10 w-full" aria-labelledby="delivery-links-heading">
          <SectionHeading>
            <span id="delivery-links-heading">Pesan via Aplikasi</span>
          </SectionHeading>
          <div className="flex flex-col gap-3">
            {deliveryLinks.map((link) => (
              <LinkButton key={link.label} {...link} />
            ))}
          </div>
        </section>

        <footer className="mt-auto flex w-full flex-col items-center">
          <p className="mb-4 font-heading text-sm italic text-daun-500">
            Temukan Kami di
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-3" aria-label="Media sosial">
            {socialLinks.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href || undefined}
                target={href ? '_blank' : undefined}
                rel={href ? 'noopener noreferrer' : undefined}
                aria-label={label}
                aria-disabled={!href}
                title={href ? label : `${label} belum tersedia`}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-daun-300/40 bg-krem-50/90 text-daun-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-110 hover:border-transparent hover:bg-oranye-500 hover:text-white hover:shadow-lg ${
                  href ? '' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <Icon size={20} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <p className="mt-8 text-xs font-medium text-daun-500/80">
            &copy; {new Date().getFullYear()} Alas Daun Restaurant
          </p>
        </footer>
      </main>
    </div>
  );
}
