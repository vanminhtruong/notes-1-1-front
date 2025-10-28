import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '@/services/settingsService';
import { useTheme } from '@/contexts/ThemeContext';
import { getSocket } from '@/services/socket';

export type AnimatedBackgroundTheme = 'christmas' | 'tet' | 'easter' | 'none';

interface AnimatedBackgroundState {
  enabled: boolean;
  theme: AnimatedBackgroundTheme;
}

export const useAnimatedBackground = () => {
  const { theme: appTheme } = useTheme();
  const [state, setState] = useState<AnimatedBackgroundState>({
    enabled: false,
    theme: 'none',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from backend
  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('[AnimatedBackground] No token found');
          setIsLoading(false);
          return;
        }

        console.log('[AnimatedBackground] Loading settings from backend...');
        const data = await settingsService.getAnimatedBackground();
        console.log('[AnimatedBackground] Settings loaded:', data);
        if (mounted) {
          setState(data);
        }
      } catch (error) {
        console.error('[AnimatedBackground] Failed to load settings:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for real-time updates via socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = (data: AnimatedBackgroundState) => {
      setState(data);
    };

    socket.on('animated_background_updated', handleUpdate);

    return () => {
      socket.off('animated_background_updated', handleUpdate);
    };
  }, []);

  // Update settings
  const updateSettings = useCallback(
    async (enabled: boolean, theme: AnimatedBackgroundTheme) => {
      try {
        const data = await settingsService.setAnimatedBackground({ enabled, theme });
        setState({ enabled: data.enabled, theme: data.theme });
        return { success: true };
      } catch (error) {
        console.error('Failed to update animated background settings:', error);
        return { success: false, error };
      }
    },
    []
  );

  // Only show animated background when dark-black theme is active
  const shouldShow = appTheme === 'dark-black' && state.enabled;

  return {
    enabled: shouldShow,
    theme: state.theme,
    rawEnabled: state.enabled,
    isLoading,
    updateSettings,
  };
};
