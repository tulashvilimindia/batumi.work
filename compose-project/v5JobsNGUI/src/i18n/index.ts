/**
 * i18n Module - Internationalization
 * Exports i18n configuration and language utilities
 */

// i18n instance and configuration
export { default as i18n } from './config';
export {
  supportedLanguages,
  isValidLanguage,
  getCurrentLanguage,
  changeLanguage,
} from './config';
export type { SupportedLanguage } from './config';

// Language hook
export {
  useLanguage,
  getLanguageFromPath,
  buildLocalizedUrl,
} from './useLanguage';
export type { UseLanguageReturn } from './useLanguage';

// Re-export react-i18next utilities
export { useTranslation, Trans } from 'react-i18next';
