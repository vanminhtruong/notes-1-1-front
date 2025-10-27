import { useCallback } from 'react';
import type { NoteFolder } from '@/services/notesService';

interface UseModalsHandlerProps {
  setShowShareModal: (show: boolean) => void;
  setShowMoveToFolderModal: (show: boolean) => void;
  setNoteToMove: (note: any | null) => void;
  setShowMoveOutOfFolderModal: (show: boolean) => void;
  setNoteToMoveOut: (note: any | null) => void;
  setShowCreateFolderModal: (show: boolean) => void;
  setShowEditFolderModal: (show: boolean) => void;
  setEditingFolder: (folder: NoteFolder | null) => void;
}

export const useModalsHandler = ({
  setShowShareModal,
  setShowMoveToFolderModal,
  setNoteToMove,
  setShowMoveOutOfFolderModal,
  setNoteToMoveOut,
  setShowCreateFolderModal,
  setShowEditFolderModal,
  setEditingFolder,
}: UseModalsHandlerProps) => {
  const handleOpenShareModal = useCallback(() => setShowShareModal(true), [setShowShareModal]);
  const handleCloseShareModal = useCallback(() => setShowShareModal(false), [setShowShareModal]);

  const handleOpenMoveToFolder = useCallback((note: any) => {
    setNoteToMove(note);
    setShowMoveToFolderModal(true);
  }, [setNoteToMove, setShowMoveToFolderModal]);

  const handleCloseMoveToFolder = useCallback(() => {
    setShowMoveToFolderModal(false);
    setNoteToMove(null);
  }, [setShowMoveToFolderModal, setNoteToMove]);

  const handleOpenMoveOutOfFolder = useCallback((note: any) => {
    setNoteToMoveOut(note);
    setShowMoveOutOfFolderModal(true);
  }, [setNoteToMoveOut, setShowMoveOutOfFolderModal]);

  const handleCloseMoveOutOfFolder = useCallback(() => {
    setShowMoveOutOfFolderModal(false);
    setNoteToMoveOut(null);
  }, [setShowMoveOutOfFolderModal, setNoteToMoveOut]);

  const handleOpenCreateFolderModal = useCallback(() => setShowCreateFolderModal(true), [setShowCreateFolderModal]);
  const handleCloseCreateFolderModal = useCallback(() => setShowCreateFolderModal(false), [setShowCreateFolderModal]);

  const handleOpenEditFolderModal = useCallback((folder: NoteFolder) => {
    setEditingFolder(folder);
    setShowEditFolderModal(true);
  }, [setEditingFolder, setShowEditFolderModal]);

  const handleCloseEditFolderModal = useCallback(() => {
    setShowEditFolderModal(false);
    setEditingFolder(null);
  }, [setShowEditFolderModal, setEditingFolder]);

  return {
    handleOpenShareModal,
    handleCloseShareModal,
    handleOpenMoveToFolder,
    handleCloseMoveToFolder,
    handleOpenMoveOutOfFolder,
    handleCloseMoveOutOfFolder,
    handleOpenCreateFolderModal,
    handleCloseCreateFolderModal,
    handleOpenEditFolderModal,
    handleCloseEditFolderModal,
  };
};
