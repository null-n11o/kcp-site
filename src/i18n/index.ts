import { ja } from './ja';
import { en } from './en';
import type { Locale, Translations } from './types';

export type { Locale, Translations };

const translations: Record<Locale, Translations> = { ja, en };

export function useTranslations(locale: string | undefined): Translations {
  const key = (locale ?? 'ja') as Locale;
  return translations[key] ?? translations.ja;
}
