import { useEffect, useState } from 'react';
import { LanguageProvider } from './lib/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Uniqueness } from './components/Uniqueness';
import { MenuSection } from './components/MenuSection';
import { About } from './components/About';
import { Gallery } from './components/Gallery';
import { Testimonials } from './components/Testimonials';
import { Reservation } from './components/Reservation';
import { LocationMap } from './components/LocationMap';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Admin } from './components/Admin';

function MainSite() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Uniqueness />
        <MenuSection />
        <About />
        <Gallery />
        <Testimonials />
        <Reservation />
        <LocationMap />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

function App() {
  const [route, setRoute] = useState<string>(window.location.hash);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const isAdmin = route.startsWith('#admin') || route === '#/admin' || route === '#admin';

  return (
    <LanguageProvider>
      {isAdmin ? <Admin /> : <MainSite />}
    </LanguageProvider>
  );
}

export default App;
