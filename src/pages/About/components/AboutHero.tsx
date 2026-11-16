import LazyLoad from '@/components/LazyLoad';
import { useAboutContent } from '../hooks/useAboutContent';
import { BookOpen, Star } from 'lucide-react';

export default function AboutHero() {
  const { t } = useAboutContent();
  return (
    <>
        {/* Hero Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0}>
          <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl sm-down:text-3xl xs-down:text-2xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-xl sm-down:text-lg xs-down:text-base text-gray-600 dark:text-gray-300 mb-8 xs-down:mb-6 max-w-3xl mx-auto px-2">
            {t('hero.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 dark:text-gray-300 font-medium xs-down:text-sm">
              {t('hero.rating')}
            </span>
          </div>
          </div>
        </LazyLoad>

    </>
  );
}
