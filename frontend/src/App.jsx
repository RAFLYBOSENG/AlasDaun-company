import { useEffect, useState } from 'react';
import { LanguageProvider } from './lib/LanguageContext';
import { Admin } from './components/Admin';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Uniqueness } from './components/Uniqueness';
import { MenuSection } from './components/MenuSection';
import { About } from './components/About';
import { Gallery } from './components/Gallery';
import { Testimonials } from './components/Testimonials';
import { LocationMap } from './components/LocationMap';
import { Footer } from './components/Footer';
import { AnimatedSection } from './components/AnimatedSection';
function MainSite() {
    return (<>
      <Navbar />
      <main>
        <AnimatedSection><Hero /></AnimatedSection>
        <AnimatedSection delay={0.05}><Uniqueness /></AnimatedSection>
        <AnimatedSection><MenuSection /></AnimatedSection>
        <AnimatedSection delay={0.05}><About /></AnimatedSection>
        <AnimatedSection><Gallery /></AnimatedSection>
        <AnimatedSection delay={0.05}><Testimonials /></AnimatedSection>
        <AnimatedSection><LocationMap /></AnimatedSection>
      </main>
      <AnimatedSection><Footer /></AnimatedSection>
    </>);
}
function App() {
    const [isAdmin, setIsAdmin] = useState(() => {
        return window.location.pathname === '/admin' || /^#\/?admin(?:$|\/)/.test(window.location.hash);
    });

    useEffect(() => {
        const updateRoute = () => {
            setIsAdmin(window.location.pathname === '/admin' || /^#\/?admin(?:$|\/)/.test(window.location.hash));
        };
        window.addEventListener('hashchange', updateRoute);
        window.addEventListener('popstate', updateRoute);
        return () => {
            window.removeEventListener('hashchange', updateRoute);
            window.removeEventListener('popstate', updateRoute);
        };
    }, []);

    return (<LanguageProvider>
      {isAdmin ? <Admin /> : <MainSite />}
    </LanguageProvider>);
}
export default App;
