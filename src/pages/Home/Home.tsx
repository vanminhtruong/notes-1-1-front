import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation('home');

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t('title')}</h1>
      <p className="text-gray-700 dark:text-gray-300">{t('welcome')}</p>
    </section>
  )
}
