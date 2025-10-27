import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { notesService, type Note } from '@/services/notesService';

interface UsePinNoteHandlerReturn {
  isPinning: boolean;
  pinNote: (noteId: number) => Promise<void>;
  unpinNote: (noteId: number) => Promise<void>;
  togglePin: (note: Note) => Promise<void>;
}

export const usePinNoteHandler = (
  onPinSuccess?: (note: Note) => void,
  onUnpinSuccess?: (note: Note) => void
): UsePinNoteHandlerReturn => {
  const { t } = useTranslation('dashboard');
  const [isPinning, setIsPinning] = useState(false);

  const pinNote = async (noteId: number): Promise<void> => {
    try {
      setIsPinning(true);
      const response = await notesService.pinNote(noteId);
      
      toast.success(t(response.message) || t('notes.pinSuccess'));
      
      if (onPinSuccess) {
        onPinSuccess(response.note);
      }
    } catch (error: any) {
      console.error('Error pinning note:', error);
      toast.error(error.response?.data?.message || t('notes.pinError'));
      throw error;
    } finally {
      setIsPinning(false);
    }
  };

  const unpinNote = async (noteId: number): Promise<void> => {
    try {
      setIsPinning(true);
      const response = await notesService.unpinNote(noteId);
      
      toast.success(t(response.message) || t('notes.unpinSuccess'));
      
      if (onUnpinSuccess) {
        onUnpinSuccess(response.note);
      }
    } catch (error: any) {
      console.error('Error unpinning note:', error);
      toast.error(error.response?.data?.message || t('notes.unpinError'));
      throw error;
    } finally {
      setIsPinning(false);
    }
  };

  const togglePin = async (note: Note): Promise<void> => {
    if (note.isPinned) {
      await unpinNote(note.id);
    } else {
      await pinNote(note.id);
    }
  };

  return {
    isPinning,
    pinNote,
    unpinNote,
    togglePin,
  };
};
