import { useState } from 'react';
import { notesService } from '@/services/notesService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const useNoteBackground = () => {
  const { t } = useTranslation('dashboard');
  const [isUpdating, setIsUpdating] = useState(false);

  const updateBackground = async (
    noteId: number,
    backgroundColor: string | null,
    backgroundImage: string | null
  ) => {
    setIsUpdating(true);
    try {
      await notesService.updateNote(noteId, {
        backgroundColor,
        backgroundImage,
      });
      
      toast.success(t('notes.background.updateSuccess'));
      return true;
    } catch (error) {
      console.error('Failed to update note background:', error);
      toast.error(t('notes.background.updateError'));
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateBackground,
    isUpdating,
  };
};
