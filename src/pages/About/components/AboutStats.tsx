import LazyLoad from '@/components/LazyLoad';
import { useAboutContent } from '../hooks/useAboutContent';

export default function AboutStats() {
  const { stats } = useAboutContent();
  return (
    <>
        {/* Stats Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm-down:gap-4 xs-down:gap-3 mb-16 xs-down:mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 sm-down:p-5 xs-down:p-4 border border-white/20 dark:border-gray-700/30 text-center">
              <div className="text-3xl xs-down:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm xs-down:text-xs text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </div>
          ))}
          </div>
        </LazyLoad>

    </>
  );
}
