import { useTranslation } from 'react-i18next';
import { HeartHandshake } from 'lucide-react';
import LazyLoad from '@/components/LazyLoad';

export default function ContactAside() {
  const { t } = useTranslation('contact');
  return (
    <>
          {/* Aside */}
          <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} reAnimate={false}>
            <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-7 sm-down:p-6 xs-down:p-5 text-white">
              <h3 className="text-xl xs-down:text-lg font-bold mb-2">{t('aside.title')}</h3>
              <p className="text-white/90 mb-4 xs-down:text-sm">{t('aside.subtitle')}</p>
              <div data-icon-hover className="flex items-center gap-3 xs-down:gap-2.5">
                <HeartHandshake className="w-6 h-6 xs-down:w-5 xs-down:h-5" />
                <span className="text-white/90 xs-down:text-sm">{t('aside.cta')}</span>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-6 sm-down:p-5 xs-down:p-4 border border-white/20 dark:border-gray-700/30">
              <h4 className="text-lg xs-down:text-base font-semibold text-gray-900 dark:text-white mb-3">{t('hours.title')}</h4>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1 xs-down:text-sm">
                <li>{t('hours.weekdays')}</li>
                <li>{t('hours.weekend')}</li>
              </ul>
            </div>
            </div>
          </LazyLoad>
    </>
  );
}
