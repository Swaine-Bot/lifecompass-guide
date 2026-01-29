import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, translations, languageNames } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const { user, profile } = useAuth();

  // Load language from profile on mount
  useEffect(() => {
    if (profile?.language) {
      const lang = profile.language as Language;
      if (translations[lang]) {
        setLanguageState(lang);
      }
    }
  }, [profile?.language]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    
    // Persist to database if user is logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('user_id', user.id);
    }
    
    // Also store in localStorage for non-authenticated users
    localStorage.setItem('lifestack-language', lang);
  }, [user]);

  // Load from localStorage on initial render for non-authenticated users
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('lifestack-language') as Language;
      if (stored && translations[stored]) {
        setLanguageState(stored);
      }
    }
  }, [user]);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
