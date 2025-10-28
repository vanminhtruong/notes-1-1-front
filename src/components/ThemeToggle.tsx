import { memo, useState, useRef, useEffect } from 'react';
import { Moon, Sun, Palette, Check, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAnimatedBackground, type AnimatedBackgroundTheme } from '@/hooks/useAnimatedBackground';
import toast from 'react-hot-toast';

const ThemeToggle = memo(() => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('layout');
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme: bgTheme, updateSettings, isLoading } = useAnimatedBackground();
  const [isUpdating, setIsUpdating] = useState(false);

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

  const backgroundThemeOptions: Array<{ value: AnimatedBackgroundTheme; labelKey: string }> = [
    { value: 'none', labelKey: 'animatedBackground.none' },
    { value: 'christmas', labelKey: 'animatedBackground.christmas' },
    { value: 'tet', labelKey: 'animatedBackground.tet' },
    { value: 'easter', labelKey: 'animatedBackground.easter' },
  ];

  const currentThemeOption = themeOptions.find(opt => opt.value === theme) || themeOptions[0];
  const CurrentIcon = currentThemeOption.icon;

  const handleBackgroundThemeChange = async (newTheme: AnimatedBackgroundTheme) => {
    setIsUpdating(true);
    try {
      // Đổi sang dark-black theme và set background theme
      setTheme('dark-black');
      const enabled = newTheme !== 'none';
      const result = await updateSettings(enabled, newTheme);
      if (result.success) {
        toast.success(t('animatedBackground.updated'));
        setIsOpen(false);
      } else {
        toast.error(t('animatedBackground.updateFailed'));
      }
    } catch (error) {
      toast.error(t('animatedBackground.updateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 md-down:p-1.5"
        aria-label={t('theme.selectTheme')}
        title={t('theme.selectTheme')}
      >
        <CurrentIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 md-down:w-4 md-down:h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 lg-down:w-44 md-down:w-40 sm-down:w-36">
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            const isDarkBlack = option.value === 'dark-black';
            
            return (
              <div
                key={option.value}
                className="relative group"
                onMouseEnter={() => isDarkBlack && setHoveredTheme(option.value)}
                onMouseLeave={(e) => {
                  if (isDarkBlack) {
                    // Kiểm tra xem chuột có di chuyển vào submenu không
                    const relatedTarget = e.relatedTarget;
                    if (!relatedTarget || !(relatedTarget instanceof Element) || !relatedTarget.closest('.theme-submenu')) {
                      setHoveredTheme(null);
                    }
                  }
                }}
              >
                <button
                  onClick={() => {
                    if (!isDarkBlack) {
                      setTheme(option.value);
                      setIsOpen(false);
                    }
                    // Nếu là dark-black, không làm gì cả, chỉ hiển thị submenu qua hover
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-150 md-down:px-3 md-down:py-1.5 sm-down:px-2.5"
                >
                  <div className="flex items-center gap-3 md-down:gap-2">
                    <OptionIcon className="w-4 h-4 text-gray-600 dark:text-gray-300 md-down:w-3.5 md-down:h-3.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-200 md-down:text-xs">{t(option.labelKey)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Chỉ hiển thị check mark cho theme không phải dark-black */}
                    {theme === option.value && !isDarkBlack && (
                      <Check className="w-4 h-4 text-blue-500 dark:text-blue-400 md-down:w-3.5 md-down:h-3.5" />
                    )}
                    {isDarkBlack && (
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 md-down:w-3.5 md-down:h-3.5" />
                    )}
                  </div>
                </button>

                {/* Submenu for dark-black theme */}
                {isDarkBlack && hoveredTheme === option.value && (
                  <div 
                    className="theme-submenu absolute left-full top-0 ml-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 lg-down:w-44 md-down:w-40 sm-down:w-36 sm-down:left-auto sm-down:right-full sm-down:mr-1 sm-down:ml-0"
                    onMouseEnter={() => setHoveredTheme(option.value)}
                    onMouseLeave={() => setHoveredTheme(null)}
                  >
                    {backgroundThemeOptions.map((bgOption) => (
                      <button
                        key={bgOption.value}
                        onClick={() => handleBackgroundThemeChange(bgOption.value)}
                        disabled={isLoading || isUpdating}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed md-down:px-3 md-down:py-1.5 sm-down:px-2.5"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-200 md-down:text-xs">
                          {t(bgOption.labelKey)}
                        </span>
                        {theme === 'dark-black' && bgTheme === bgOption.value && (
                          <Check className="w-4 h-4 text-purple-500 dark:text-purple-400 md-down:w-3.5 md-down:h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
