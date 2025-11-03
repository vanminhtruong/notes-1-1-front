import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '@/services/settingsService';
import { useTheme } from '@/contexts/ThemeContext';
import { getSocket } from '@/services/socket';

export type AnimatedBackgroundTheme = 'christmas' | 'tet' | 'easter' | 'halloween' | 'none';

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

  // Load settings (only when logged in; otherwise keep defaults)
  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('[AnimatedBackground] No token found; keeping defaults (no persistence)');
          if (mounted) {
            setState({ enabled: false, theme: 'none' });
          }
          if (mounted) {
            setIsLoading(false);
          }
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
        // Set default state on error
        if (mounted) {
          setState({ enabled: false, theme: 'none' });
        }
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
    if (!socket) {
      console.log('[AnimatedBackground] No socket connection');
      return;
    }

    console.log('[AnimatedBackground] Setting up socket listener');

    const handleUpdate = (data: AnimatedBackgroundState) => {
      console.log('[AnimatedBackground] Received WebSocket update:', data);
      setState(data);
    };

    socket.on('animated_background_updated', handleUpdate);

    return () => {
      console.log('[AnimatedBackground] Cleaning up socket listener');
      socket.off('animated_background_updated', handleUpdate);
    };
  }, []);

  // Update settings with optimistic update (transient when logged-out)
  const updateSettings = useCallback(
    async (enabled: boolean, theme: AnimatedBackgroundTheme) => {
      console.log('[AnimatedBackground] Updating settings:', { enabled, theme });
      // Optimistic update - update UI immediately
      const previousState = { ...state };
      const newState = { enabled, theme };
      setState(newState);

      try {
        const token = localStorage.getItem('token');
        // If not logged in: do not persist anywhere; allow temporary effect only
        if (!token) {
          console.log('[AnimatedBackground] Not logged in; applying temporary effect (no persistence)');
          return { success: true };
        }

        // If logged in, save to backend
        console.log('[AnimatedBackground] Logged in, saving to backend');
        const data = await settingsService.setAnimatedBackground({ enabled, theme });
        // Server will broadcast via WebSocket to all connected clients
        console.log('[AnimatedBackground] Saved successfully:', data);
        return { success: true };
      } catch (error) {
        console.error('[AnimatedBackground] Failed to update settings:', error);
        // Rollback on error
        setState(previousState);
        return { success: false, error };
      }
    },
    [state]
  );

  // Show animated background when enabled, regardless of theme
  // This allows background to work on login pages and persist during logout
  const shouldShow = state.enabled;

  return {
    enabled: shouldShow,
    theme: state.theme,
    rawEnabled: state.enabled,
    isLoading,
    updateSettings,
    appTheme, // Export appTheme for components that need it
  };
};
