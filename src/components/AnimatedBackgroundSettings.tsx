import { memo, useState } from 'react';
import { Sparkles, Check, Lock } from 'lucide-react';
import { useAnimatedBackground, type AnimatedBackgroundTheme } from '@/hooks/useAnimatedBackground';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const AnimatedBackgroundSettings = memo(() => {
  const { theme: appTheme } = useTheme();
  const { rawEnabled, theme, updateSettings, isLoading } = useAnimatedBackground();
  const { t } = useTranslation('layout');
  const [isUpdating, setIsUpdating] = useState(false);

  // Only show when dark-black theme is active
  if (appTheme !== 'dark-black') {
    return null;
  }

  const themeOptions: Array<{ value: AnimatedBackgroundTheme; labelKey: string }> = [
    { value: 'none', labelKey: 'animatedBackground.none' },
    { value: 'christmas', labelKey: 'animatedBackground.christmas' },
    { value: 'tet', labelKey: 'animatedBackground.tet' },
    { value: 'easter', labelKey: 'animatedBackground.easter' },
    { value: 'halloween', labelKey: 'animatedBackground.halloween' },
  ];

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const result = await updateSettings(!rawEnabled, theme);
      if (result.success) {
        toast.success(t('animatedBackground.updated'), { duration: 2000 });
      } else {
        toast.error(t('animatedBackground.updateFailed'));
      }
    } catch (error) {
      toast.error(t('animatedBackground.updateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThemeChange = async (newTheme: AnimatedBackgroundTheme) => {
    if (isUpdating || newTheme === theme) return;
    setIsUpdating(true);
    try {
      const result = await updateSettings(rawEnabled, newTheme);
      if (result.success) {
        toast.success(t('animatedBackground.updated'), { duration: 2000 });
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
    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('animatedBackground.title')}
            </span>
          </div>
          <button
            onClick={handleToggle}
            disabled={isLoading || isUpdating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              rawEnabled
                ? 'bg-purple-600 dark:bg-purple-500'
                : 'bg-gray-300 dark:bg-gray-600'
            } ${isLoading || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                rawEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-1">
          {!rawEnabled && (
            <div className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{t('animatedBackground.disabled')}</span>
            </div>
          )}
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              disabled={isLoading || isUpdating || !rawEnabled}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-between transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${!rawEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {t(option.labelKey)}
              </span>
              {theme === option.value && (
                <Check className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

AnimatedBackgroundSettings.displayName = 'AnimatedBackgroundSettings';

export default AnimatedBackgroundSettings;
