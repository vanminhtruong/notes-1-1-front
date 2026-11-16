import { useTranslation } from 'react-i18next';
import { Send, MessageSquare, ShieldCheck } from 'lucide-react';
import LazyLoad from '@/components/LazyLoad';
import toast from 'react-hot-toast';
import ContactCards from './components/ContactCards';
import ContactAside from './components/ContactAside';

const Contact = () => {
  const { t } = useTranslation('contact');
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.error(t('form.notConfigured'));
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md-down:py-10 sm-down:py-8 xs-down:py-6">
        {/* Hero */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0}>
          <div className="text-center mb-12">
          <div data-icon-hover className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/70 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/30 shadow-sm mb-4">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('hero.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl sm-down:text-3xl xs-down:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
            {t('hero.subtitle')}
          </p>
          </div>
        </LazyLoad>

        <ContactCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm-down:gap-6 xs-down:gap-5 items-start">
          {/* Form */}
          <div className="lg:col-span-2">
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} reAnimate={false}>
              <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-10 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30">
              <h2 className="text-2xl sm-down:text-xl xs-down:text-lg font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">{t('form.title')}</h2>
              <form onSubmit={handleSubmit} className="space-y-5 xs-down:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 xs-down:gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">{t('form.name')}</label>
                    <input className="w-full px-4 py-3 xs-down:py-2.5 rounded-xl border bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white" placeholder={t('form.namePh')!} required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">{t('form.email')}</label>
                    <input type="email" className="w-full px-4 py-3 xs-down:py-2.5 rounded-xl border bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white" placeholder={t('form.emailPh')!} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">{t('form.subject')}</label>
                  <input className="w-full px-4 py-3 xs-down:py-2.5 rounded-xl border bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white" placeholder={t('form.subjectPh')!} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">{t('form.message')}</label>
                  <textarea rows={5} className="w-full px-4 py-3 xs-down:py-2.5 rounded-xl border bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white" placeholder={t('form.messagePh')!} required />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 xs-down:gap-2.5 sm:items-center sm:justify-between">
                  <div data-icon-hover className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <span className="text-sm xs-down:text-xs">{t('form.privacyNote')}</span>
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 xs-down:px-5 py-3 xs-down:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60">
                    <Send className="w-5 h-5 xs-down:w-4 xs-down:h-4" />
                    {t('form.send')}
                  </button>
                </div>
              </form>
              </div>
            </LazyLoad>
          </div>

          <ContactAside />
        </div>
      </div>
    </div>
  );
};

export default Contact;
