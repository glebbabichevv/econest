import { useCallback, useState, useEffect } from 'react';
import { translations, languages, type Language } from '@/lib/i18n';

// Get saved language from localStorage or default to English
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('econest-language') || 'en';
  }
  return 'en';
};

export function useI18n() {
  const [currentLanguage, setCurrentLanguage] = useState<string>(getSavedLanguage);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('econest-language', currentLanguage);
    }
  }, [currentLanguage]);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage as keyof typeof translations];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation is missing
        let fallbackValue: any = translations.en;
        for (const fallbackKey of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
            fallbackValue = fallbackValue[fallbackKey];
          } else {
            console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
            return key;
          }
        }
        return typeof fallbackValue === 'string' ? fallbackValue : key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [currentLanguage]);

  const changeLanguage = useCallback((languageCode: string) => {
    const language = languages.find(lang => lang.code === languageCode);
    if (language) {
      setCurrentLanguage(languageCode);
    }
  }, []);

  const getCurrentLanguage = useCallback((): Language => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  }, [currentLanguage]);

  return {
    language: currentLanguage,
    currentLanguage: getCurrentLanguage(),
    availableLanguages: languages,
    changeLanguage,
    t
  };
}