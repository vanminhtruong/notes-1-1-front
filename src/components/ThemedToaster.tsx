import { Toaster } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemedToaster = () => {
  const { theme } = useTheme();

  // Define colors based on theme
  const isDarkBlack = theme === 'dark-black';
  const isDark = theme === 'dark' || isDarkBlack;

  // For dark-black theme, use neutral gray tones instead of bright colors
  const successBg = isDarkBlack ? '#2a2a2a' : (isDark ? '#10b981' : '#10b981');
  const errorBg = isDarkBlack ? '#3a1a1a' : (isDark ? '#ef4444' : '#ef4444');
  const defaultBg = isDarkBlack ? '#1a1a1a' : (isDark ? '#363636' : '#363636');

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: defaultBg,
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: successBg,
          },
        },
        error: {
          duration: 5000,
          style: {
            background: errorBg,
          },
        },
      }}
    />
  );
};
