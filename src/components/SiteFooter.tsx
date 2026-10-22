import { ArrowUpRight, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SiteFooter() {
  const { t } = useTranslation('layout');
  const linkClass = 'inline-flex items-center gap-1.5 rounded text-sm text-gray-600 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-400 dark:hover:text-white';

  return (
    <footer className="border-t border-gray-200/80 bg-white/90 dark:border-gray-700/40 dark:bg-gray-900/90">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-10 sm-down:px-4 sm-down:pt-8">
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-12 pb-8 md-down:grid-cols-2 md-down:gap-8">
          <div className="md-down:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Sprout className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">PlantHub</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">{t('footer.description')}</p>
          </div>

          <nav aria-label={t('footer.explore')}>
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{t('footer.explore')}</h2>
            <ul className="space-y-3">
              <li><Link className={linkClass} to="/dashboard">{t('nav.dashboard')}</Link></li>
              <li><Link className={linkClass} to="/categories">{t('nav.categories')}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t('footer.connect')}>
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{t('footer.connect')}</h2>
            <ul className="space-y-3">
              <li><Link className={linkClass} to="/about">{t('nav.about')}</Link></li>
              <li><Link className={linkClass} to="/contact">{t('nav.contact')}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-200/80 pt-5 text-xs leading-5 text-gray-500 dark:border-gray-700/40 dark:text-gray-400 sm-down:flex-col sm-down:items-start">
          <p>© {new Date().getFullYear()} PlantHub. {t('footer.copyright')}.</p>
          <p>{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>
  );
}
