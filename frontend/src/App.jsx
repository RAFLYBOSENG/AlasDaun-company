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
import { LinkInBio } from './components/LinkInBio';

const DEFAULT_ADMIN_PATH = '/Admin-PAlasDaun';
const configuredAdminPath = import.meta.env.VITE_ADMIN_PATH?.trim();
const ADMIN_PATH = configuredAdminPath?.startsWith('/')
    && !configuredAdminPath.includes('#')
    && !configuredAdminPath.includes('?')
    ? configuredAdminPath.replace(/\/+$/, '') || DEFAULT_ADMIN_PATH
    : DEFAULT_ADMIN_PATH;

function isAdminPath(pathname) {
    return pathname === ADMIN_PATH || pathname === `${ADMIN_PATH}/`;
}

function MainSite() {
    return (<div className="min-w-0 overflow-x-hidden">
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
    </div>);
}
function App() {
    const [isLinkInBio, setIsLinkInBio] = useState(() => (
        window.location.pathname === '/links'
        || /^#\/?links(?:$|\/)/.test(window.location.hash)
    ));
    const [isAdmin, setIsAdmin] = useState(() => isAdminPath(window.location.pathname));

    useEffect(() => {
        const updateRoute = () => {
            setIsAdmin(isAdminPath(window.location.pathname));
            setIsLinkInBio(window.location.pathname === '/links' || /^#\/?links(?:$|\/)/.test(window.location.hash));
        };
        window.addEventListener('hashchange', updateRoute);
        window.addEventListener('popstate', updateRoute);
        return () => {
            window.removeEventListener('hashchange', updateRoute);
            window.removeEventListener('popstate', updateRoute);
        };
    }, []);

    return (<LanguageProvider>
      {isAdmin ? <Admin /> : isLinkInBio ? <LinkInBio /> : <MainSite />}
    </LanguageProvider>);
}
export default App;
