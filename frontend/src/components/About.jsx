import { useLang } from '../lib/language-context';
import { companyProfile, restaurantInfo } from '../data/content';
export function About() {
    const { lang, dict } = useLang();
    const story = lang === 'id' ? companyProfile.storyId : companyProfile.storyEn;
    const mission = lang === 'id' ? companyProfile.missionId : companyProfile.missionEn;
    const philosophy = lang === 'id' ? companyProfile.philosophyId : companyProfile.philosophyEn;
    return (<section id="tentang" className="bg-krem-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* video */}
          <div className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-3xl shadow-card">
              <video
                src="/vidaboutus/alasdaun.mp4"
                title="Video suasana rumah makan Alas Daun"
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
                className="aspect-video h-full min-h-[320px] w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-daun-900/40 to-transparent"/>
              <a
                href="https://youtu.be/Du9jdliX9Zk"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 rounded-full bg-daun-900/75 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-daun-900"
              >
                Buka di YouTube
              </a>
            </div>
            {/* Decorative leaf accent */}
            <div className="absolute -left-4 -top-4 -z-10 h-32 w-32 rounded-full bg-daun-200/40 blur-2xl"/>
            <div className="absolute -bottom-4 -right-4 -z-10 h-32 w-32 rounded-full bg-oranye-300/40 blur-2xl"/>
            <div className="absolute bottom-4 left-4 rounded-2xl bg-krem-100/95 px-5 py-3 shadow-soft backdrop-blur-sm">
              <p className="font-heading text-2xl font-bold text-daun-600">{companyProfile.founded}</p>
              <p className="font-body text-xs text-daun-500">{lang === 'id' ? 'Berdiri di Bandung' : 'Founded in Bandung'}</p>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <p className="mb-2 font-body text-sm font-semibold uppercase tracking-widest text-oranye-500">{dict.about.title}</p>
            <h2 className="mb-6 font-heading text-3xl font-bold text-daun-600 sm:text-4xl">{dict.about.subtitle}</h2>

            <div className="space-y-4 font-body text-base leading-relaxed text-daun-800/85">
              {story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <p><em className="font-heading text-oranye-600">{lang === 'id' ? 'Wilujeung sumping, mangga linggih.' : 'Welcome, please have a seat.'}</em></p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-krem-100 p-6 shadow-soft">
            <h3 className="mb-3 font-heading text-xl font-bold text-daun-700">{lang === 'id' ? 'Visi' : 'Vision'}</h3>
            <p className="font-body leading-relaxed text-daun-800/80">{lang === 'id' ? companyProfile.visionId : companyProfile.visionEn}</p>
            <h3 className="mb-3 mt-6 font-heading text-xl font-bold text-daun-700">{lang === 'id' ? 'Misi' : 'Mission'}</h3>
            <ul className="list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-daun-800/80">{mission.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="rounded-2xl bg-krem-100 p-6 shadow-soft">
            <h3 className="mb-3 font-heading text-xl font-bold text-daun-700">{lang === 'id' ? 'Filosofi Alas Daun' : 'Our Philosophy'}</h3>
            <ul className="mb-5 flex flex-wrap gap-2">{philosophy.map((item) => <li key={item} className="rounded-full bg-daun-50 px-3 py-1.5 font-body text-sm text-daun-700">{item}</li>)}</ul>
            <p className="font-heading text-lg font-bold text-oranye-600">{restaurantInfo.taglineId}</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-daun-800/80">{lang === 'id' ? 'Setiap meja dialasi daun pisang segar dan pramusaji berkeliling menyajikan nasi serta kuah sesuai porsi yang diinginkan pelanggan.' : 'Every table is covered with fresh banana leaves while servers bring rice and gravy according to each guest’s preference.'}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl bg-daun-50 p-6">
            <h3 className="mb-3 font-heading text-xl font-bold text-daun-700">{lang === 'id' ? 'Milestone' : 'Milestones'}</h3>
            <ul className="space-y-2 font-body text-sm leading-relaxed text-daun-800/80">{companyProfile.milestones.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="rounded-2xl bg-daun-50 p-6">
            <h3 className="mb-3 font-heading text-xl font-bold text-daun-700">{lang === 'id' ? 'Menu Signature' : 'Signature Dishes'}</h3>
            <ul className="space-y-2 font-body text-sm text-daun-800/80">{companyProfile.signatureDishes.map((item) => <li key={item}>• {item}</li>)}</ul>
            <h4 className="mb-2 mt-5 font-heading font-bold text-daun-700">{lang === 'id' ? 'Minuman Signature' : 'Signature Beverages'}</h4>
            <ul className="space-y-2 font-body text-sm text-daun-800/80">{companyProfile.signatureBeverages.map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
          <div className="rounded-2xl bg-daun-50 p-6">
            <h3 className="mb-3 font-heading text-xl font-bold text-daun-700">{lang === 'id' ? 'Outlet & Fasilitas' : 'Outlet & Facilities'}</h3>
            <p className="mb-3 font-body text-sm text-daun-800/80">{companyProfile.capacity}</p>
            <ul className="space-y-2 font-body text-sm text-daun-800/80">{companyProfile.facilities.map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
        </div>
      </div>
      <div className="leaf-divider mt-16"/>
    </section>);
}
