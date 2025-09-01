import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all language files
import layoutEn from '@/pages/layouts/language/en.json';
import layoutVi from '@/pages/layouts/language/vi.json';
import homeEn from '@/pages/Home/language/en.json';
import homeVi from '@/pages/Home/language/vi.json';
import dashboardEn from '@/pages/Dashboard/language/en.json';
import dashboardVi from '@/pages/Dashboard/language/vi.json';
import accountEn from '@/pages/Account/language/en.json';
import accountVi from '@/pages/Account/language/vi.json';
import authEn from '@/pages/auth/language/en.json';
import authVi from '@/pages/auth/language/vi.json';

const resources = {
  en: {
    layout: layoutEn,
    home: homeEn,
    dashboard: dashboardEn,
    account: accountEn,
    auth: authEn,
  },
  vi: {
    layout: layoutVi,
    home: homeVi,
    dashboard: dashboardVi,
    account: accountVi,
    auth: authVi,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    defaultNS: 'layout',
    ns: ['layout', 'home', 'dashboard', 'account', 'auth'],
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
