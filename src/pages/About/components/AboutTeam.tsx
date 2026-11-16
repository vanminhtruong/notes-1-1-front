import LazyLoad from '@/components/LazyLoad';
import { useAboutContent } from '../hooks/useAboutContent';
import { Award } from 'lucide-react';

export default function AboutTeam() {
  const { t } = useAboutContent();
  return (
    <>
        {/* Team Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={500}>
          <div className="text-center mb-16 xs-down:mb-10">
          <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
            {t('team.title')}
          </h2>
          <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 xs-down:mb-8 px-2">
            {t('team.description')}
          </p>

          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-center gap-4 xs-down:gap-3 mb-6 xs-down:mb-4">
              <Award className="w-8 h-8 xs-down:w-7 xs-down:h-7 text-yellow-500" />
              <h3 className="text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white">
                {t('team.award.title')}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg xs-down:text-base">
              {t('team.award.description')}
            </p>
          </div>
          </div>
        </LazyLoad>

    </>
  );
}
