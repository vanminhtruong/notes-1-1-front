import LazyLoad from '@/components/LazyLoad';
import { useAboutContent } from '../hooks/useAboutContent';
import { Link } from 'react-router-dom';

export default function AboutContact() {
  const { t } = useAboutContent();
  return (
    <>
        {/* Contact Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={600}>
          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30 text-center">
          <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 mb-8 xs-down:mb-6 max-w-2xl mx-auto px-2">
            {t('contact.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 xs-down:gap-3 justify-center">
            <Link to="/contact" className="px-8 xs-down:px-6 py-3 xs-down:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-semibold">
              {t('contact.button.primary')}
            </Link>
            <button className="px-8 xs-down:px-6 py-3 xs-down:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold">
              {t('contact.button.secondary')}
            </button>
          </div>
          </div>
        </LazyLoad>
    </>
  );
}
