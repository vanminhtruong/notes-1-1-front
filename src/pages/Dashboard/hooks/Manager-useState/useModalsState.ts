import { useState } from 'react';
import type { NoteFolder } from '@/services/notesService';

export const useModalsState = () => {
  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);

  // Move to folder modal
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [noteToMove, setNoteToMove] = useState<any | null>(null);

  // Move out of folder modal
  const [showMoveOutOfFolderModal, setShowMoveOutOfFolderModal] = useState(false);
  const [noteToMoveOut, setNoteToMoveOut] = useState<any | null>(null);

  // Folder modals
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);

  return {
    showShareModal,
    setShowShareModal,
    showMoveToFolderModal,
    setShowMoveToFolderModal,
    noteToMove,
    setNoteToMove,
    showMoveOutOfFolderModal,
    setShowMoveOutOfFolderModal,
    noteToMoveOut,
    setNoteToMoveOut,
    showCreateFolderModal,
    setShowCreateFolderModal,
    showEditFolderModal,
    setShowEditFolderModal,
    editingFolder,
    setEditingFolder,
  };
};
