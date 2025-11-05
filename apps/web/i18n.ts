import { getRequestConfig } from 'next-intl/server';
import enMessages from './messages/en.json';
import ruMessages from './messages/ru.json';

export const locales = ['en', 'ru'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Fallback to 'en' if locale is not supported
  const validLocale = locales.includes(locale as Locale) ? locale : 'en';

  let messages;
  if (validLocale === 'ru') {
    messages = ruMessages;
  } else {
    messages = enMessages; // Default to English
  }

  return {
    locale: validLocale,
    messages
  };
});







