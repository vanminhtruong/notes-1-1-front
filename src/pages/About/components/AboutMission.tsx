import LazyLoad from '@/components/LazyLoad';
import { useAboutContent } from '../hooks/useAboutContent';

export default function AboutMission() {
  const { t, features } = useAboutContent();
  return (
    <>
        {/* Mission Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={200}>
          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30 mb-16 xs-down:mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
              {t('mission.title')}
            </h2>
            <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-2">
              {t('mission.description')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm-down:gap-6 xs-down:gap-5">
            {features.map((feature, index) => (
              <div key={index} data-icon-hover className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg xs-down:text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 xs-down:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </LazyLoad>

    </>
  );
}
