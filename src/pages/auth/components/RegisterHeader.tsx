import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

export default function RegisterHeader() {
  const { t } = useTranslation('auth');
  return (
    <>
        {/* Header */}
        <div className="text-center mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 lg-down:w-14 lg-down:h-14 md-down:w-12 md-down:h-12 sm-down:w-10 sm-down:h-10 sm-down:mb-3 xs-down:mb-2.5">
            <Sparkles className="w-8 h-8 text-white lg-down:w-7 lg-down:h-7 md-down:w-6 md-down:h-6 sm-down:w-5 sm-down:h-5" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base sm-down:mb-1.5 xs-down:text-sm">{t('createAccount')}</h1>
          <p className="text-gray-600 dark:text-gray-300 px-2 lg-down:text-sm md-down:text-sm sm-down:text-xs xs-down:px-1">{t('registerSubtitle')}</p>
        </div>

    </>
  );
}
