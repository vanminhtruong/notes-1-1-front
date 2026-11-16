import LazyLoad from '@/components/LazyLoad';
import { useAboutContent } from '../hooks/useAboutContent';
import { CheckCircle } from 'lucide-react';

export default function AboutWhyChoose() {
  const { t } = useAboutContent();
  return (
    <>
        {/* Why Choose Us Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={400}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 sm-down:p-6 xs-down:p-5 text-white mb-16 xs-down:mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold mb-6 xs-down:mb-4">
              {t('whyChoose.title')}
            </h2>
            <p className="text-xl sm-down:text-lg xs-down:text-base opacity-90 max-w-3xl mx-auto px-2">
              {t('whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm-down:gap-5 xs-down:gap-4">
            {[
              t('whyChoose.items.easy'),
              t('whyChoose.items.fast'),
              t('whyChoose.items.secure'),
              t('whyChoose.items.reliable'),
              t('whyChoose.items.support'),
              t('whyChoose.items.updates'),
            ].map((item, index) => (
              <div key={index} data-icon-hover className="flex items-center gap-3 xs-down:gap-2">
                <CheckCircle className="w-6 h-6 xs-down:w-5 xs-down:h-5 text-green-300 flex-shrink-0" />
                <span className="text-white/90 xs-down:text-sm">{item}</span>
              </div>
            ))}
          </div>
          </div>
        </LazyLoad>

    </>
  );
}
