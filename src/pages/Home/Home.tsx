import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation('home');

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 xl-down:py-9 lg-down:py-8 md-down:py-7 sm-down:py-6 xs-down:py-5 xl-down:px-3.5 lg-down:px-3 md-down:px-2.5 sm-down:px-2">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base xs-down:text-sm lg-down:mb-3 sm-down:mb-2.5">{t('title')}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 lg-down:text-base md-down:text-sm sm-down:text-xs">{t('welcome')}</p>
    </section>
  )
}
