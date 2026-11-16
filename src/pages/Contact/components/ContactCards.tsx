import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import LazyLoad from '@/components/LazyLoad';

export default function ContactCards() {
  const { t } = useTranslation('contact');
  return (
    <>
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm-down:gap-5 xs-down:gap-4 mb-12 xs-down:mb-8">
        {[{
          icon: <Mail className="w-6 h-6" />, title: t('cards.email.title'), value: t('cards.email.value')
        },{
          icon: <Phone className="w-6 h-6" />, title: t('cards.phone.title'), value: t('cards.phone.value')
        },{
          icon: <MapPin className="w-6 h-6" />, title: t('cards.address.title'), value: t('cards.address.value')
        }].map((c, i) => (
          <LazyLoad key={i} threshold={0.1} rootMargin="50px" animationDuration={500} delay={100 + (i * 100)}>
            <div data-icon-hover className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 sm-down:p-5 xs-down:p-4 border border-white/20 dark:border-gray-700/30 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
              <div className="w-12 h-12 xs-down:w-10 xs-down:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                {c.icon}
              </div>
              <h3 className="text-lg xs-down:text-base font-semibold text-gray-900 dark:text-white">{c.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1 xs-down:text-sm">{c.value}</p>
            </div>
          </LazyLoad>
        ))}
        </div>
    </>
  );
}
