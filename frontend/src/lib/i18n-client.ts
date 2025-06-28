export const locales = ['en', 'hi', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'pt', 'it', 'nl', 'ru'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }
  
  return defaultLocale;
}

export function removeLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && locales.includes(potentialLocale as Locale)) {
    return '/' + segments.slice(2).join('/');
  }
  
  return pathname;
}

export async function loadMessages(locale: Locale) {
  try {
    const messages = await import(`../../messages/${locale}.json`);
    return messages.default;
  } catch (error) {
    console.warn(`Failed to load messages for locale ${locale}, falling back to ${defaultLocale}`);
    const messages = await import(`../../messages/${defaultLocale}.json`);
    return messages.default;
  }
} 