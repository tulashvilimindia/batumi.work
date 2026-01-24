/**
 * useLanguage Hook
 * Provides language management with URL synchronization
 */
import { useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SupportedLanguage,
  supportedLanguages,
  isValidLanguage,
  getCurrentLanguage,
} from './config';

export interface UseLanguageReturn {
  /** Current language code */
  language: SupportedLanguage;
  /** All supported languages */
  supportedLanguages: readonly SupportedLanguage[];
  /** Whether current language is Georgian */
  isGeorgian: boolean;
  /** Whether current language is English */
  isEnglish: boolean;
  /** Change language and update URL */
  changeLanguage: (lang: SupportedLanguage) => void;
  /** Toggle between Georgian and English */
  toggleLanguage: () => void;
  /** Get localized path */
  getLocalizedPath: (path: string) => string;
  /** Get translation function */
  t: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * Hook for managing language state and URL synchronization
 *
 * @example
 * const { language, changeLanguage, t } = useLanguage();
 *
 * // Change language
 * changeLanguage('en');
 *
 * // Toggle between languages
 * toggleLanguage();
 *
 * // Use translations
 * <span>{t('common.search')}</span>
 */
export function useLanguage(): UseLanguageReturn {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ lang?: string }>();

  // Get current language from URL params or i18n
  const language: SupportedLanguage = useMemo(() => {
    const urlLang = params.lang;
    if (urlLang && isValidLanguage(urlLang)) {
      return urlLang;
    }
    return getCurrentLanguage();
  }, [params.lang]);

  // Sync i18n with URL language
  useMemo(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [i18n, language]);

  const isGeorgian = language === 'ge';
  const isEnglish = language === 'en';

  /**
   * Get path with language prefix
   */
  const getLocalizedPath = useCallback(
    (path: string): string => {
      // Remove any existing language prefix
      const cleanPath = path.replace(/^\/(ge|en)(\/|$)/, '/');
      // Add current language prefix
      return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
    },
    [language]
  );

  /**
   * Change language and update URL
   */
  const changeLanguage = useCallback(
    (newLang: SupportedLanguage) => {
      if (!isValidLanguage(newLang) || newLang === language) {
        return;
      }

      // Update i18n
      i18n.changeLanguage(newLang);

      // Update URL - replace language in path
      const currentPath = location.pathname;
      const newPath = currentPath.replace(
        /^\/(ge|en)(\/|$)/,
        `/${newLang}$2`
      );

      // Navigate to new URL with same search params
      navigate(
        {
          pathname: newPath || `/${newLang}`,
          search: location.search,
        },
        { replace: true }
      );
    },
    [i18n, language, location, navigate]
  );

  /**
   * Toggle between Georgian and English
   */
  const toggleLanguage = useCallback(() => {
    changeLanguage(isGeorgian ? 'en' : 'ge');
  }, [changeLanguage, isGeorgian]);

  return {
    language,
    supportedLanguages,
    isGeorgian,
    isEnglish,
    changeLanguage,
    toggleLanguage,
    getLocalizedPath,
    t,
  };
}

/**
 * Get language from URL path (for static contexts)
 */
export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const match = pathname.match(/^\/(ge|en)(\/|$)/);
  const lang = match ? match[1] : 'ge';
  return isValidLanguage(lang) ? lang : 'ge';
}

/**
 * Build URL with language prefix
 */
export function buildLocalizedUrl(
  pathname: string,
  lang: SupportedLanguage,
  search?: string
): string {
  const cleanPath = pathname.replace(/^\/(ge|en)(\/|$)/, '/');
  const langPath = `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
  return search ? `${langPath}${search}` : langPath;
}

export default useLanguage;
