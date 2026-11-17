import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Step = 'email' | 'otp' | 'reset';

const ORDER: Step[] = ['email', 'otp', 'reset'];
const LABELS = ['stepEmail', 'stepOtp', 'stepNewPassword'] as const;

/** 3-step progress: done = check, current = gradient + ring, upcoming = muted. */
export default function ResetSteps({ step }: { step: Step }) {
  const { t } = useTranslation('auth');
  const current = ORDER.indexOf(step);

  return (
    <ol className="mb-6 flex items-center" aria-label={t('forgotTitle')}>
      {LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className={`flex items-center ${i < LABELS.length - 1 ? 'flex-1' : ''}`} aria-current={active ? 'step' : undefined}>
            <div className="flex items-center gap-2">
              <span
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                  done || active
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/30'
                    : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400',
                  active ? 'ring-4 ring-purple-500/20' : '',
                ].join(' ')}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`text-sm font-medium transition-colors duration-300 sm-down:hidden ${
                  active ? 'text-gray-900 dark:text-white' : done ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t(label)}
              </span>
            </div>
            {i < LABELS.length - 1 && (
              <span
                aria-hidden="true"
                className={`mx-3 h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  done ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200 dark:bg-white/10'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
