/**
 * i18n Configuration
 * Sets up i18next with Georgian and English translations
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ge from './locales/ge.json';
import en from './locales/en.json';

// Custom language detector from URL path
const pathLanguageDetector = {
  name: 'path',
  lookup(): string | undefined {
    const path = window.location.pathname;
    const match = path.match(/^\/(ge|en)(\/|$)/);
    return match ? match[1] : undefined;
  },
  cacheUserLanguage(lng: string): void {
    localStorage.setItem('i18nextLng', lng);
  },
};

// Configure language detector
const languageDetector = new LanguageDetector();
languageDetector.addDetector(pathLanguageDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ge: { translation: ge },
      en: { translation: en },
    },
    fallbackLng: 'ge',
    supportedLngs: ['ge', 'en'],
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;

export const supportedLanguages = ['ge', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

/**
 * Check if a language code is supported
 */
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return supportedLanguages.includes(lang as SupportedLanguage);
}

/**
 * Get the current language from i18n instance
 */
export function getCurrentLanguage(): SupportedLanguage {
  const currentLang = i18n.language;
  return isValidLanguage(currentLang) ? currentLang : 'ge';
}

/**
 * Change language and update URL
 */
export function changeLanguage(lang: SupportedLanguage): void {
  if (isValidLanguage(lang)) {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  }
}
