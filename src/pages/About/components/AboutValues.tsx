import LazyLoad from '@/components/LazyLoad';
import { useAboutContent } from '../hooks/useAboutContent';

export default function AboutValues() {
  const { t, values } = useAboutContent();
  return (
    <>
        {/* Values Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300}>
          <div className="mb-16 xs-down:mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
              {t('values.title')}
            </h2>
            <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm-down:gap-6 xs-down:gap-5">
            {values.map((value, index) => (
              <div key={index} data-icon-hover className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30 text-center hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl xs-down:text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 xs-down:text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
          </div>
        </LazyLoad>

    </>
  );
}
