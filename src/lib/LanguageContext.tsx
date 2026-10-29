import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Lang } from '../data/content';
import { getDict, type Dict } from '../data/i18n';

interface LangCtx {
  lang: Lang;
  dict: Dict;
  toggle: () => void;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'id';
    return (localStorage.getItem('alasdaun-lang') as Lang) || 'id';
  });

  useEffect(() => {
    localStorage.setItem('alasdaun-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = () => setLangState((p) => (p === 'id' ? 'en' : 'id'));
  const setLang = (l: Lang) => setLangState(l);

  return (
    <LanguageContext.Provider value={{ lang, dict: getDict(lang), toggle, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
