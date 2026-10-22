import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all language files
import layoutEn from '@/pages/layouts/language/en.json';
import layoutVi from '@/pages/layouts/language/vi.json';
import layoutKo from '@/pages/layouts/language/ko.json';
import homeEn from '@/pages/Home/language/en.json';
import homeVi from '@/pages/Home/language/vi.json';
import homeKo from '@/pages/Home/language/ko.json';
import dashboardEn from '@/pages/Dashboard/language/en.json';
import dashboardVi from '@/pages/Dashboard/language/vi.json';
import dashboardKo from '@/pages/Dashboard/language/ko.json';
import aboutEn from '@/pages/About/language/en.json';
import aboutVi from '@/pages/About/language/vi.json';
import aboutKo from '@/pages/About/language/ko.json';
import accountEn from '@/pages/Account/language/en.json';
import accountVi from '@/pages/Account/language/vi.json';
import accountKo from '@/pages/Account/language/ko.json';
import authEn from '@/pages/auth/language/en.json';
import authVi from '@/pages/auth/language/vi.json';
import authKo from '@/pages/auth/language/ko.json';
import contactEn from '@/pages/Contact/language/en.json';
import contactVi from '@/pages/Contact/language/vi.json';
import contactKo from '@/pages/Contact/language/ko.json';
import categoriesEn from '@/pages/Categories/language/en.json';
import categoriesVi from '@/pages/Categories/language/vi.json';
import categoriesKo from '@/pages/Categories/language/ko.json';

import layoutZhCn from '@/pages/layouts/language/zh-CN.json';
import layoutZhTw from '@/pages/layouts/language/zh-TW.json';
import homeZhCn from '@/pages/Home/language/zh-CN.json';
import homeZhTw from '@/pages/Home/language/zh-TW.json';
import dashboardZhCn from '@/pages/Dashboard/language/zh-CN.json';
import dashboardZhTw from '@/pages/Dashboard/language/zh-TW.json';
import aboutZhCn from '@/pages/About/language/zh-CN.json';
import aboutZhTw from '@/pages/About/language/zh-TW.json';
import accountZhCn from '@/pages/Account/language/zh-CN.json';
import accountZhTw from '@/pages/Account/language/zh-TW.json';
import authZhCn from '@/pages/auth/language/zh-CN.json';
import authZhTw from '@/pages/auth/language/zh-TW.json';
import contactZhCn from '@/pages/Contact/language/zh-CN.json';
import contactZhTw from '@/pages/Contact/language/zh-TW.json';
import categoriesZhCn from '@/pages/Categories/language/zh-CN.json';
import categoriesZhTw from '@/pages/Categories/language/zh-TW.json';

const resources = {
  en: {
    layout: layoutEn,
    home: homeEn,
    dashboard: dashboardEn,
    about: aboutEn,
    contact: contactEn,
    account: accountEn,
    auth: authEn,
    categories: categoriesEn,
  },
  vi: {
    layout: layoutVi,
    home: homeVi,
    dashboard: dashboardVi,
    about: aboutVi,
    contact: contactVi,
    account: accountVi,
    auth: authVi,
    categories: categoriesVi,
  },
  ko: {
    layout: layoutKo,
    home: homeKo,
    dashboard: dashboardKo,
    about: aboutKo,
    contact: contactKo,
    account: accountKo,
    auth: authKo,
    categories: categoriesKo,
  },
  'zh-CN': {
    layout: layoutZhCn,
    home: homeZhCn,
    dashboard: dashboardZhCn,
    about: aboutZhCn,
    contact: contactZhCn,
    account: accountZhCn,
    auth: authZhCn,
    categories: categoriesZhCn,
  },
  'zh-TW': {
    layout: layoutZhTw,
    home: homeZhTw,
    dashboard: dashboardZhTw,
    about: aboutZhTw,
    contact: contactZhTw,
    account: accountZhTw,
    auth: authZhTw,
    categories: categoriesZhTw,
  },
};

// Get saved language from localStorage first, fallback to 'en'
const getSavedLanguage = (): string | undefined => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || undefined;
  }
  return undefined;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: getSavedLanguage(), // Use saved language or let detector decide
    defaultNS: 'layout',
    ns: ['layout', 'home', 'dashboard', 'about', 'contact', 'account', 'auth', 'categories'],

    detection: {
      order: ['localStorage', 'cookie', 'navigator'], // localStorage first!
      caches: ['localStorage', 'cookie'],
      lookupCookie: 'lang',
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
