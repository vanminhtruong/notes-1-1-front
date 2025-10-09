import { useState, useCallback } from 'react';
import type { NoteFolder } from '@/services/notesService';

export const useModals = () => {
  // Share Note Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const handleOpenShareModal = useCallback(() => setShowShareModal(true), []);
  const handleCloseShareModal = useCallback(() => setShowShareModal(false), []);

  // Move to Folder Modal
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [noteToMove, setNoteToMove] = useState<any>(null);
  
  const handleOpenMoveToFolder = useCallback((note: any) => {
    setNoteToMove(note);
    setShowMoveToFolderModal(true);
  }, []);

  const handleCloseMoveToFolder = useCallback(() => {
    setShowMoveToFolderModal(false);
    setNoteToMove(null);
  }, []);

  // Move Out of Folder Modal
  const [showMoveOutOfFolderModal, setShowMoveOutOfFolderModal] = useState(false);
  const [noteToMoveOut, setNoteToMoveOut] = useState<any>(null);
  
  const handleOpenMoveOutOfFolder = useCallback((note: any) => {
    setNoteToMoveOut(note);
    setShowMoveOutOfFolderModal(true);
  }, []);

  const handleCloseMoveOutOfFolder = useCallback(() => {
    setShowMoveOutOfFolderModal(false);
    setNoteToMoveOut(null);
  }, []);

  // Folder Modals
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);

  const handleOpenCreateFolderModal = useCallback(() => setShowCreateFolderModal(true), []);
  const handleCloseCreateFolderModal = useCallback(() => setShowCreateFolderModal(false), []);

  const handleOpenEditFolderModal = useCallback((folder: NoteFolder) => {
    setEditingFolder(folder);
    setShowEditFolderModal(true);
  }, []);

  const handleCloseEditFolderModal = useCallback(() => {
    setShowEditFolderModal(false);
    setEditingFolder(null);
  }, []);

  return {
    // Share Modal
    showShareModal,
    handleOpenShareModal,
    handleCloseShareModal,

    // Move to Folder Modal
    showMoveToFolderModal,
    noteToMove,
    handleOpenMoveToFolder,
    handleCloseMoveToFolder,

    // Move Out of Folder Modal
    showMoveOutOfFolderModal,
    noteToMoveOut,
    handleOpenMoveOutOfFolder,
    handleCloseMoveOutOfFolder,

    // Folder Modals
    showCreateFolderModal,
    showEditFolderModal,
    editingFolder,
    handleOpenCreateFolderModal,
    handleCloseCreateFolderModal,
    handleOpenEditFolderModal,
    handleCloseEditFolderModal,
  };
};
