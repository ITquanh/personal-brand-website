export const i18n = {
  defaultLocale: 'zh',
  locales: ['zh', 'en'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

const dictionaries = {
  zh: () => import('@/dictionaries/zh.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (!i18n.locales.includes(locale)) {
    return dictionaries[i18n.defaultLocale]();
  }
  return dictionaries[locale]();
};
