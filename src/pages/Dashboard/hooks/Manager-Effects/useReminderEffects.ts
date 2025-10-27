import { useEffect, useRef } from 'react';
import { startReminderRinging, stopReminderRinging } from '@/utils/notificationSound';

interface UseReminderEffectsProps {
  dueReminderNoteIds: number[];
}

export const useReminderEffects = ({ dueReminderNoteIds }: UseReminderEffectsProps) => {
  // Continuous ringing while any due reminders exist; vibrate on new arrivals
  const prevDueCount = useRef(0);
  
  useEffect(() => {
    if (dueReminderNoteIds.length > 0) {
      // Start continuous ringing every 3s (plays immediately and then repeats)
      startReminderRinging(3000);
      // Vibrate only when count increases (new reminder comes in)
      if (dueReminderNoteIds.length > prevDueCount.current) {
        try {
          (window.navigator as any).vibrate?.(150);
        } catch {}
      }
    } else {
      // No due reminders => stop ringing
      stopReminderRinging();
    }
    prevDueCount.current = dueReminderNoteIds.length;
  }, [dueReminderNoteIds]);

  // If audio was blocked, start continuous ringing once audio gets unlocked
  useEffect(() => {
    const onUnlocked = () => {
      if (dueReminderNoteIds.length > 0) startReminderRinging(3000);
    };
    window.addEventListener('audio-unlocked', onUnlocked);
    return () => window.removeEventListener('audio-unlocked', onUnlocked);
  }, [dueReminderNoteIds]);

  // Stop ringing on unmount just in case
  useEffect(() => () => stopReminderRinging(), []);
};
