import { memo, useState, useRef, useEffect } from 'react';
import { Moon, Sun, Palette, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAnimatedBackground, type AnimatedBackgroundTheme } from '@/hooks/useAnimatedBackground';
import toast from 'react-hot-toast';
import { preloadAnimatedBackgrounds } from '~/utils/preload';
import { useLocation } from 'react-router-dom';

const ThemeToggle = memo(() => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('layout');
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme: bgTheme, updateSettings, isLoading } = useAnimatedBackground();
  const [isUpdating, setIsUpdating] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const location = useLocation();
  
  // Check if on login/register/forgot-password pages
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

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

  // Detect touch/mobile environment (no hover)
  useEffect(() => {
    try {
      const mq = window.matchMedia('(hover: none), (pointer: coarse)');
      setIsTouchDevice(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
      // @ts-ignore: Safari legacy
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
      return () => {
        // @ts-ignore: Safari legacy
        mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
      };
    } catch {
      setIsTouchDevice(false);
    }
  }, []);

  // Detect small viewport (mobile breakpoints) to support desktop emulators
  useEffect(() => {
    try {
      const mq = window.matchMedia('(max-width: 768px)');
      setIsMobileViewport(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
      // @ts-ignore: Safari legacy
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
      return () => {
        // @ts-ignore: Safari legacy
        mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
      };
    } catch {
      setIsMobileViewport(false);
    }
  }, []);

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
    { value: 'halloween', labelKey: 'animatedBackground.halloween' },
  ];

  const currentThemeOption = themeOptions.find(opt => opt.value === theme) || themeOptions[0];
  const CurrentIcon = currentThemeOption.icon;

  const handleBackgroundThemeChange = async (newTheme: AnimatedBackgroundTheme) => {
    setIsUpdating(true);
    try {
      // Đổi sang dark-black theme và set background theme
      setTheme('dark-black');
      // Warm up dynamic chunks immediately for instant switch
      preloadAnimatedBackgrounds();
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
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Preload background bundles when opening the menu
            preloadAnimatedBackgrounds();
          }
        }}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 md-down:p-1.5"
        aria-label={t('theme.selectTheme')}
        title={t('theme.selectTheme')}
      >
        <CurrentIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 md-down:w-4 md-down:h-4" />
      </button>

      {isOpen && (
        <div className={`absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 lg-down:w-44 md-down:w-40 sm-down:w-36 ${
          isAuthPage ? 'left-0 -translate-x-[calc(100%-2.5rem)]' : 'right-0'
        }`}>
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            const isDarkBlack = option.value === 'dark-black';
            
            return (
              <div
                key={option.value}
                className="relative group"
                onMouseEnter={() => {
                  if (isDarkBlack && !isTouchDevice) {
                    if (closeTimerRef.current) {
                      window.clearTimeout(closeTimerRef.current);
                      closeTimerRef.current = null;
                    }
                    setHoveredTheme(option.value);
                    preloadAnimatedBackgrounds();
                  }
                }}
                onMouseLeave={(e) => {
                  if (isDarkBlack && !isTouchDevice) {
                    const relatedTarget = e.relatedTarget as Element | null;
                    const toSubmenu = !!(relatedTarget && relatedTarget.closest && relatedTarget.closest('.theme-submenu'));
                    if (!toSubmenu) {
                      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
                      closeTimerRef.current = window.setTimeout(() => {
                        setHoveredTheme(null);
                        closeTimerRef.current = null;
                      }, 180);
                    }
                  }
                }}
              >
                <button
                  onClick={() => {
                    if (!isDarkBlack) {
                      setTheme(option.value);
                      setIsOpen(false);
                    } else {
                      // On touch/mobile, tap to toggle submenu
                      if (isTouchDevice) {
                        setHoveredTheme(prev => (prev === option.value ? null : option.value));
                        preloadAnimatedBackgrounds();
                      }
                    }
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-150 md-down:px-3 md-down:py-1.5 sm-down:px-2.5"
                >
                  <div className="flex items-center gap-3 md-down:gap-2">
                    {isDarkBlack && (isTouchDevice || isMobileViewport) && (
                      isAuthPage ? (
                        <ChevronLeft className="w-4 h-4 text-gray-400 dark:text-gray-500 md-down:w-3.5 md-down:h-3.5" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 md-down:w-3.5 md-down:h-3.5 transform rotate-180" />
                      )
                    )}
                    <OptionIcon className="w-4 h-4 text-gray-600 dark:text-gray-300 md-down:w-3.5 md-down:h-3.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-200 md-down:text-xs">{t(option.labelKey)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {theme === option.value && !isDarkBlack && (
                      <Check className="w-4 h-4 text-blue-500 dark:text-blue-400 md-down:w-3.5 md-down:h-3.5" />
                    )}
                    {isDarkBlack && !(isTouchDevice || isMobileViewport) && (
                      isAuthPage ? (
                        <ChevronLeft className="w-4 h-4 text-gray-400 dark:text-gray-500 md-down:w-3.5 md-down:h-3.5" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 md-down:w-3.5 md-down:h-3.5" />
                      )
                    )}
                  </div>
                </button>

                {/* Submenu for dark-black theme */}
                {isDarkBlack && hoveredTheme === option.value && (
                  <div 
                    className={`theme-submenu absolute top-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 lg-down:w-44 md-down:w-40 sm-down:w-36 ${
                      isAuthPage ? 'right-full mr-1' : 'left-full ml-1 sm-down:left-auto sm-down:right-full sm-down:mr-1 sm-down:ml-0'
                    }`}
                    onMouseEnter={() => {
                      if (!isTouchDevice) {
                        if (closeTimerRef.current) {
                          window.clearTimeout(closeTimerRef.current);
                          closeTimerRef.current = null;
                        }
                        setHoveredTheme(option.value);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isTouchDevice) {
                        if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
                        closeTimerRef.current = window.setTimeout(() => {
                          setHoveredTheme(null);
                          closeTimerRef.current = null;
                        }, 180);
                      }
                    }}
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
