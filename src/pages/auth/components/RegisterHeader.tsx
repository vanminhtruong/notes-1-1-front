import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

export default function RegisterHeader() {
  const { t } = useTranslation('auth');
  return (
    <div className="reg-header mb-7 md-down:mb-6 lg:mb-6">
      {/* Brand chip: the large-screen brand panel already shows it, so it is only needed on small screens. */}
      <div className="mb-5 flex items-center gap-3 lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">PlantHub</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md-down:text-2xl lg:text-[1.7rem] lg:leading-tight">
        {t('createAccount')}
      </h1>
      <p className="reg-header-sub mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{t('registerSubtitle')}</p>
    </div>
  );
}
