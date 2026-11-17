import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Full class names are listed literally so Tailwind can detect them at build time.
const LEVELS = [
  { label: 'strengthWeak', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  { label: 'strengthFair', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { label: 'strengthGood', bar: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  { label: 'strengthStrong', bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
] as const;

interface PasswordStrengthProps {
  password?: string;
}

/**
 * Visual-only hint, it never blocks submission (the real rules stay in the form validation).
 * Absolutely positioned below its field so showing/hiding it never changes the page height.
 */
export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation('auth');

  const score = useMemo(() => {
    if (!password) return 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password) && /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    return Math.max(1, checks.filter(Boolean).length);
  }, [password]);

  if (!password) return null;
  const level = LEVELS[score - 1];

  return (
    <div
      className="absolute left-0 right-0 top-full flex items-center gap-2 pt-1.5"
      role="status"
      aria-label={t('passwordStrength')}
    >
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {LEVELS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? level.bar : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <span className={`text-[11px] font-semibold leading-none ${level.text}`}>{t(level.label)}</span>
    </div>
  );
}
