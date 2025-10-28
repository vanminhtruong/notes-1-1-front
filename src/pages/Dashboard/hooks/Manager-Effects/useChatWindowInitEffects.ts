import { useEffect } from 'react';

interface UseChatWindowInitEffectsProps {
  loadNotifications: () => Promise<void>;
  loadBellFeed: (page?: number, limit?: number) => Promise<void>;
}

export const useChatWindowInitEffects = ({
  loadNotifications,
  loadBellFeed,
}: UseChatWindowInitEffectsProps) => {
  useEffect(() => {
    loadNotifications();
    loadBellFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
