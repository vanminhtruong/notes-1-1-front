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

const resources = {
  en: {
    layout: layoutEn,
    home: homeEn,
    dashboard: dashboardEn,
    about: aboutEn,
    contact: contactEn,
    account: accountEn,
    auth: authEn,
  },
  vi: {
    layout: layoutVi,
    home: homeVi,
    dashboard: dashboardVi,
    about: aboutVi,
    contact: contactVi,
    account: accountVi,
    auth: authVi,
  },
  ko: {
    layout: layoutKo,
    home: homeKo,
    dashboard: dashboardKo,
    about: aboutKo,
    contact: contactKo,
    account: accountKo,
    auth: authKo,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    defaultNS: 'layout',
    ns: ['layout', 'home', 'dashboard', 'about', 'contact', 'account', 'auth'],
    
    detection: {
      order: ['cookie', 'navigator', 'htmlTag'],
      caches: ['cookie'],
      lookupCookie: 'lang',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
