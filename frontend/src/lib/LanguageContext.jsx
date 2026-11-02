import { useEffect, useState } from 'react';
import { getDict } from '../data/i18n';
import { LanguageContext } from './language-context';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'id';
    return localStorage.getItem('alasdaun-lang') || 'id';
  });

  useEffect(() => {
    localStorage.setItem('alasdaun-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = () => setLangState((previous) => (previous === 'id' ? 'en' : 'id'));
  const setLang = (nextLang) => setLangState(nextLang);

  return (
    <LanguageContext.Provider value={{ lang, dict: getDict(lang), toggle, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
