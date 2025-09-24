import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const { t } = useTranslation('contact');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Placeholder submit. Hook up to backend endpoint later.
      await new Promise((res) => setTimeout(res, 800));
      toast.success(t('form.success'));
    } catch {
      toast.error(t('form.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md-down:py-10 sm-down:py-8 xs-down:py-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/70 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/30 shadow-sm mb-4">
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

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm-down:gap-5 xs-down:gap-4 mb-12 xs-down:mb-8">
          {[{
            icon: <Mail className="w-6 h-6" />, title: t('cards.email.title'), value: t('cards.email.value')
          },{
            icon: <Phone className="w-6 h-6" />, title: t('cards.phone.title'), value: t('cards.phone.value')
          },{
            icon: <MapPin className="w-6 h-6" />, title: t('cards.address.title'), value: t('cards.address.value')
          }].map((c, i) => (
            <div key={i} className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 sm-down:p-5 xs-down:p-4 border border-white/20 dark:border-gray-700/30 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
              <div className="w-12 h-12 xs-down:w-10 xs-down:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                {c.icon}
              </div>
              <h3 className="text-lg xs-down:text-base font-semibold text-gray-900 dark:text-white">{c.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1 xs-down:text-sm">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm-down:gap-6 xs-down:gap-5 items-start">
          {/* Form */}
          <div className="lg:col-span-2 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-10 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30">
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
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span className="text-sm xs-down:text-xs">{t('form.privacyNote')}</span>
                </div>
                <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-6 xs-down:px-5 py-3 xs-down:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60">
                  <Send className="w-5 h-5 xs-down:w-4 xs-down:h-4" />
                  {loading ? t('form.sending') : t('form.send')}
                </button>
              </div>
            </form>
          </div>

          {/* Aside */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-7 sm-down:p-6 xs-down:p-5 text-white">
              <h3 className="text-xl xs-down:text-lg font-bold mb-2">{t('aside.title')}</h3>
              <p className="text-white/90 mb-4 xs-down:text-sm">{t('aside.subtitle')}</p>
              <div className="flex items-center gap-3 xs-down:gap-2.5">
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
        </div>
      </div>
    </div>
  );
};

export default Contact;
