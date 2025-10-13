import { memo, useState, useRef, useEffect } from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle = memo(() => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('layout');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const themeOptions = [
    { value: 'light' as const, labelKey: 'theme.light', icon: Sun },
    { value: 'dark' as const, labelKey: 'theme.dark', icon: Moon },
    { value: 'dark-black' as const, labelKey: 'theme.darkBlack', icon: Palette },
  ];

  const currentThemeOption = themeOptions.find(opt => opt.value === theme) || themeOptions[0];
  const CurrentIcon = currentThemeOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label={t('theme.selectTheme')}
        title={t('theme.selectTheme')}
      >
        <CurrentIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <OptionIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{t(option.labelKey)}</span>
                </div>
                {theme === option.value && (
                  <Check className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
