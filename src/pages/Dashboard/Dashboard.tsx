import {
  useState, useCallback, useEffect,
  useTranslation, toast,
  useDashboard, useFolders, useBodyScrollLock, useFolderNotes,
  StatsCards, ViewToggle, type ViewMode, SearchAndFilters, BulkActionsBar, NotesGrid,
  FoldersView, FolderNotesView,
  CreateNoteModal, ViewNoteModal, EditNoteModal, CreateNoteInFolderModal, EditNoteInFolderModal,
  CreateFolderModal, EditFolderModal, MoveToFolderModal, MoveOutOfFolderModal,
  ShareNoteModal, LazyLoad,
  type NoteFolder, socketService,
  useAppDispatch, fetchNotes, fetchNoteStats
} from '@/pages/Dashboard/import';

const Dashboard = () => {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const {
    notes, isLoading, stats, pagination,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedPriority, setSelectedPriority,
    currentPage, setCurrentPage,
    showCreateModal, setShowCreateModal,
    setShowArchived,
    newNote, setNewNote,
    selectedIds, toggleSelect, clearSelection, confirmBulkDelete,
    showEditModal, setShowEditModal,
    editNote, setEditNote,
    handleCreateNote, confirmArchiveNote, confirmDeleteNote, openEdit, handleUpdateNote,
    getPriorityColor, getPriorityText,
    dueReminderNoteIds,
    acknowledgeReminderNote,
    // view
    showViewModal, setShowViewModal, viewNote, openView,
  } = useDashboard();

  // Folders hook
  const {
    folders,
    isLoading: isFoldersLoading,
    selectedFolder,
    folderNotes,
    isFolderNotesLoading,
    fetchFolderNotes,
    createFolder,
    updateFolder,
    deleteFolder,
    moveNoteToFolder,
    setSelectedFolder,
  } = useFolders();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('active');

  // Sync viewMode with showArchived filter
  useEffect(() => {
    if (viewMode === 'archived') {
      setShowArchived(true);
    } else if (viewMode === 'active') {
      setShowArchived(false);
    }
    // Reset to first page when switching tabs
    setCurrentPage(1);
  }, [viewMode, setShowArchived, setCurrentPage]);

  // Share Note Modal state  
  const [showShareModal, setShowShareModal] = useState(false);

  // Move to Folder Modal state
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [noteToMove, setNoteToMove] = useState<any>(null);

  // Move Out of Folder Modal state
  const [showMoveOutOfFolderModal, setShowMoveOutOfFolderModal] = useState(false);
  const [noteToMoveOut, setNoteToMoveOut] = useState<any>(null);

  // Folder Modals state
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);

  // Folder notes hook (for create/edit notes within folder)
  const {
    showCreateModal: showCreateNoteInFolderModal,
    newNote: newFolderNote,
    setNewNote: setNewFolderNote,
    handleOpenCreateModal: handleOpenCreateNoteInFolder,
    handleCloseCreateModal: handleCloseCreateNoteInFolder,
    handleCreateNote: handleCreateNoteInFolder,
    showEditModal: showEditNoteInFolderModal,
    editNote: editFolderNote,
    setEditNote: setEditFolderNote,
    handleOpenEditModal: handleOpenEditNoteInFolder,
    handleCloseEditModal: handleCloseEditNoteInFolder,
    handleUpdateNote: handleUpdateNoteInFolder,
  } = useFolderNotes(selectedFolder?.id || null, () => {
    if (selectedFolder) {
      fetchFolderNotes(selectedFolder.id);
    }
  });

  // Disable body scroll when modals are open
  useBodyScrollLock(showViewModal || showEditModal || showShareModal || showCreateModal);

  const handleOpenShareModal = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleShareSuccess = useCallback(() => {
    // Optionally refresh notes or update UI
    setShowViewModal(false);
  }, []);

  const handleCloseCreateModal = useCallback(() => setShowCreateModal(false), []);
  const handleOpenCreateModal = useCallback(() => setShowCreateModal(true), []);
  const handleCloseViewModal = useCallback(() => setShowViewModal(false), []);
  const handleCloseEditModal = useCallback(() => setShowEditModal(false), []);
  const handleCloseShareModal = useCallback(() => setShowShareModal(false), []);

  // Folder handlers
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

  const handleDeleteFolder = useCallback((folder: NoteFolder) => {
    toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      return (
        <div className={containerClass}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold">{t('folders.confirmDelete')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('folders.confirmDeleteDesc')}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(toastData.id)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={async () => {
                await deleteFolder(folder.id);
                toast.dismiss(toastData.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              {t('actions.delete')}
            </button>
          </div>
        </div>
      );
    }, { duration: 8000 });
  }, [deleteFolder, t]);

  const handleViewFolder = useCallback((folder: NoteFolder) => {
    fetchFolderNotes(folder.id);
  }, [fetchFolderNotes]);

  const handleBackFromFolder = useCallback(() => {
    setSelectedFolder(null);
  }, [setSelectedFolder]);

  // Wrapper functions for folder note actions
  const handleArchiveNoteInFolder = useCallback((note: any) => {
    confirmArchiveNote(note.id);
  }, [confirmArchiveNote]);

  const handleDeleteNoteInFolder = useCallback((note: any) => {
    confirmDeleteNote(note.id);
  }, [confirmDeleteNote]);

  const handleRemoveFromFolder = useCallback(async (noteId: number) => {
    await moveNoteToFolder(noteId, null); // Move to root (remove from folder)
    // Refresh folder notes
    if (selectedFolder) {
      fetchFolderNotes(selectedFolder.id);
    }
  }, [moveNoteToFolder, selectedFolder, fetchFolderNotes]);

  // Move to folder handlers
  const handleOpenMoveToFolder = useCallback((note: any) => {
    setNoteToMove(note);
    setShowMoveToFolderModal(true);
  }, []);

  const handleCloseMoveToFolder = useCallback(() => {
    setShowMoveToFolderModal(false);
    setNoteToMove(null);
  }, []);

  const handleSelectFolder = useCallback(async (folderId: number) => {
    if (!noteToMove) return;
    
    try {
      await moveNoteToFolder(noteToMove.id, folderId);
      handleCloseMoveToFolder();
    } catch (error) {
      // Error already handled by hook
    }
  }, [noteToMove, moveNoteToFolder, handleCloseMoveToFolder]);

  // Move out of folder handlers
  const handleOpenMoveOutOfFolder = useCallback((note: any) => {
    setNoteToMoveOut(note);
    setShowMoveOutOfFolderModal(true);
  }, []);

  const handleCloseMoveOutOfFolder = useCallback(() => {
    setShowMoveOutOfFolderModal(false);
    setNoteToMoveOut(null);
  }, []);

  const handleMoveToActive = useCallback(async () => {
    if (!noteToMoveOut) return;
    
    try {
      // Move out of folder (folderId = null) and unarchive (isArchived = false)
      await moveNoteToFolder(noteToMoveOut.id, null);
      // Also need to unarchive if it was archived
      if (noteToMoveOut.isArchived) {
        await confirmArchiveNote(noteToMoveOut.id); // Toggle archive status
      }
      handleCloseMoveOutOfFolder();
      // Refresh folder notes
      if (selectedFolder) {
        fetchFolderNotes(selectedFolder.id);
      }
    } catch (error) {
      // Error already handled
    }
  }, [noteToMoveOut, moveNoteToFolder, confirmArchiveNote, handleCloseMoveOutOfFolder, selectedFolder, fetchFolderNotes]);

  const handleMoveToArchived = useCallback(async () => {
    if (!noteToMoveOut) return;
    
    try {
      // Move out of folder (folderId = null) and archive (isArchived = true)
      await moveNoteToFolder(noteToMoveOut.id, null);
      // Also need to archive if not already archived
      if (!noteToMoveOut.isArchived) {
        await confirmArchiveNote(noteToMoveOut.id); // Toggle archive status
      }
      handleCloseMoveOutOfFolder();
      // Refresh folder notes
      if (selectedFolder) {
        fetchFolderNotes(selectedFolder.id);
      }
    } catch (error) {
      // Error already handled
    }
  }, [noteToMoveOut, moveNoteToFolder, confirmArchiveNote, handleCloseMoveOutOfFolder, selectedFolder, fetchFolderNotes]);

  // Listen to note_moved_to_folder event to refresh Active/Archived tabs
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNoteMoved = () => {
      // Refresh notes list and stats
      dispatch(fetchNotes({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: selectedCategory || undefined,
        priority: selectedPriority || undefined,
        isArchived: viewMode === 'archived',
      }));
      dispatch(fetchNoteStats());
    };

    socket.on('note_moved_to_folder', handleNoteMoved);

    return () => {
      socket.off('note_moved_to_folder', handleNoteMoved);
    };
  }, [dispatch, currentPage, searchTerm, selectedCategory, selectedPriority, viewMode]);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xl-down:py-7 lg-down:py-6 md-down:py-5 sm-down:py-4 xs-down:py-3 xl-down:px-3 md-down:px-2">
        {/* Stats Cards */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0}>
          <StatsCards stats={stats} />
        </LazyLoad>

        {/* View Toggle */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100}>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </LazyLoad>

        {/* Conditional rendering based on viewMode */}
        {viewMode === 'folders' ? (
          // Folders View
          selectedFolder ? (
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300}>
              <FolderNotesView
                folder={selectedFolder}
                notes={folderNotes}
                isLoading={isFolderNotesLoading}
                dueReminderNoteIds={dueReminderNoteIds}
                onBack={handleBackFromFolder}
                onView={openView}
                onEdit={handleOpenEditNoteInFolder}
                onArchive={handleArchiveNoteInFolder}
                onDelete={handleDeleteNoteInFolder}
                onAcknowledgeReminder={acknowledgeReminderNote}
                onCreateNote={handleOpenCreateNoteInFolder}
                onRemoveFromFolder={handleRemoveFromFolder}
                onMoveOutOfFolder={handleOpenMoveOutOfFolder}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
              />
            </LazyLoad>
          ) : (
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300}>
              <FoldersView
                folders={folders}
                isLoading={isFoldersLoading}
                onCreateFolder={handleOpenCreateFolderModal}
                onEditFolder={handleOpenEditFolderModal}
                onDeleteFolder={handleDeleteFolder}
                onViewFolder={handleViewFolder}
              />
            </LazyLoad>
          )
        ) : (
          // Notes View (Active or Archived)
          <>
            {/* Controls */}
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={200}>
              <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
                onCreateNote={handleOpenCreateModal}
              />
            </LazyLoad>

            <BulkActionsBar
              selectedCount={selectedIds.length}
              showArchived={viewMode === 'archived'}
              onClearSelection={clearSelection}
              onBulkDelete={confirmBulkDelete}
            />

            {/* Notes Grid */}
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={400}>
              <NotesGrid
                notes={notes}
                isLoading={isLoading}
                showArchived={viewMode === 'archived'}
                selectedIds={selectedIds}
                dueReminderNoteIds={dueReminderNoteIds}
                onToggleSelect={toggleSelect}
                onView={openView}
                onEdit={openEdit}
                onArchive={confirmArchiveNote}
                onDelete={confirmDeleteNote}
                onMoveToFolder={handleOpenMoveToFolder}
                onAcknowledgeReminder={acknowledgeReminderNote}
                onCreateNote={handleOpenCreateModal}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </LazyLoad>
          </>
        )}
      </div>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        newNote={newNote}
        setNewNote={setNewNote}
        onSubmit={handleCreateNote}
      />

      {/* View Note Modal */}
      <ViewNoteModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        note={viewNote}
        onOpenShare={handleOpenShareModal}
        getPriorityColor={getPriorityColor}
        getPriorityText={getPriorityText}
      />
      {/* Edit Note Modal */}
      <EditNoteModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        editNote={editNote}
        setEditNote={setEditNote}
        onSubmit={handleUpdateNote}
      />

      {/* Share Note Modal */}
      <ShareNoteModal
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        note={viewNote}
        onSuccess={handleShareSuccess}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={handleCloseCreateFolderModal}
        onSubmit={createFolder}
      />

      {/* Edit Folder Modal */}
      <EditFolderModal
        isOpen={showEditFolderModal}
        folder={editingFolder}
        onClose={handleCloseEditFolderModal}
        onSubmit={updateFolder}
      />

      {/* Create Note in Folder Modal */}
      {selectedFolder && (
        <CreateNoteInFolderModal
          isOpen={showCreateNoteInFolderModal}
          onClose={handleCloseCreateNoteInFolder}
          newNote={newFolderNote}
          setNewNote={setNewFolderNote}
          onSubmit={handleCreateNoteInFolder}
          folderName={selectedFolder.name}
        />
      )}

      {/* Edit Note in Folder Modal */}
      {selectedFolder && (
        <EditNoteInFolderModal
          isOpen={showEditNoteInFolderModal}
          onClose={handleCloseEditNoteInFolder}
          editNote={editFolderNote}
          setEditNote={setEditFolderNote}
          onSubmit={handleUpdateNoteInFolder}
          folderName={selectedFolder.name}
        />
      )}

      {/* Move to Folder Modal */}
      <MoveToFolderModal
        isOpen={showMoveToFolderModal}
        onClose={handleCloseMoveToFolder}
        folders={folders}
        onSelectFolder={handleSelectFolder}
        noteTitle={noteToMove?.title || ''}
      />

      {/* Move Out of Folder Modal */}
      <MoveOutOfFolderModal
        isOpen={showMoveOutOfFolderModal}
        onClose={handleCloseMoveOutOfFolder}
        onMoveToActive={handleMoveToActive}
        onMoveToArchived={handleMoveToArchived}
        noteTitle={noteToMoveOut?.title || ''}
      />
  </div>
);
};
export default Dashboard;
