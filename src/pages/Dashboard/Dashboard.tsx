import {
  useCallback,
  useDashboard, useFolders, useBodyScrollLock, useFolderNotes,
  useViewMode, useModals, useFolderHandlers, useMoveToFolder, useMoveOutOfFolder, useSocketListeners,
  StatsCards, ViewToggle, SearchAndFilters, BulkActionsBar, NotesGrid,
  FoldersView, FolderNotesView, TagsView,
  CreateNoteModal, ViewNoteModal, EditNoteModal, CreateNoteInFolderModal, EditNoteInFolderModal,
  CreateFolderModal, EditFolderModal, MoveToFolderModal, MoveOutOfFolderModal,
  TagManagementModal,
  ShareNoteModal, LazyLoad,
  useAppDispatch
} from '@/pages/Dashboard/import';
import type { NoteFolder } from '@/services/notesService';
import { useTranslation } from 'react-i18next';

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
    // categories
    categories,
    // tag management
    showTagManagementModal, setShowTagManagementModal,
  } = useDashboard();

  // Folders hook
  const {
    folders,
    isLoading: isFoldersLoading,
    selectedFolder,
    folderNotes,
    isFolderNotesLoading,
    folderNotesPagination,
    currentPage: folderCurrentPage,
    fetchFolderNotes,
    createFolder,
    updateFolder,
    deleteFolder,
    moveNoteToFolder,
    pinFolder,
    unpinFolder,
    setSelectedFolder,
  } = useFolders();

  // View mode hook
  const { viewMode, setViewMode } = useViewMode({ setShowArchived, setCurrentPage });

  // Modals hook
  const {
    showShareModal,
    handleOpenShareModal,
    handleCloseShareModal,
    showMoveToFolderModal,
    noteToMove,
    handleOpenMoveToFolder,
    handleCloseMoveToFolder,
    showMoveOutOfFolderModal,
    noteToMoveOut,
    handleOpenMoveOutOfFolder,
    handleCloseMoveOutOfFolder,
    showCreateFolderModal,
    showEditFolderModal,
    editingFolder,
    handleOpenCreateFolderModal,
    handleCloseCreateFolderModal,
    handleOpenEditFolderModal,
    handleCloseEditFolderModal,
  } = useModals();

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
    categories: folderCategories,
  } = useFolderNotes(selectedFolder?.id || null, () => {
    if (selectedFolder) {
      fetchFolderNotes(selectedFolder.id);
    }
  });

  // Folder handlers hook
  const {
    handleDeleteFolder,
    handleViewFolder,
    handleBackFromFolder,
    handleArchiveNoteInFolder,
    handleDeleteNoteInFolder,
    handleRemoveFromFolder,
  } = useFolderHandlers({
    deleteFolder,
    fetchFolderNotes,
    setSelectedFolder,
    confirmArchiveNote,
    confirmDeleteNote,
    moveNoteToFolder,
    selectedFolder,
    currentPage: folderCurrentPage,
  });

  // Move to folder hook
  const { handleSelectFolder } = useMoveToFolder({
    noteToMove,
    moveNoteToFolder,
    handleCloseMoveToFolder,
  });

  // Move out of folder hook
  const { handleMoveToActive, handleMoveToArchived } = useMoveOutOfFolder({
    noteToMoveOut,
    moveNoteToFolder,
    confirmArchiveNote,
    handleCloseMoveOutOfFolder,
    selectedFolder,
    fetchFolderNotes,
    currentPage: folderCurrentPage,
  });

  // Pin note handler
  const handlePinUpdate = useCallback((updatedNote: any) => {
    // Notes will be automatically refreshed via Redux state
    console.log('Note pinned/unpinned:', updatedNote);
  }, []);

  // Pin folder handler
  const handlePinFolder = useCallback((folder: NoteFolder) => {
    pinFolder(folder.id);
  }, [pinFolder]);

  // Unpin folder handler
  const handleUnpinFolder = useCallback((folder: NoteFolder) => {
    unpinFolder(folder.id);
  }, [unpinFolder]);

  // Socket listeners hook
  useSocketListeners({
    dispatch,
    currentPage,
    searchTerm,
    selectedCategory,
    selectedPriority,
    viewMode,
  });

  // Disable body scroll when modals are open
  useBodyScrollLock(showViewModal || showEditModal || showShareModal || showCreateModal);

  const handleShareSuccess = useCallback(() => {
    // Optionally refresh notes or update UI
    setShowViewModal(false);
  }, [setShowViewModal]);

  const handleCloseCreateModal = useCallback(() => setShowCreateModal(false), [setShowCreateModal]);
  const handleOpenCreateModal = useCallback(() => setShowCreateModal(true), [setShowCreateModal]);
  const handleCloseViewModal = useCallback(() => setShowViewModal(false), [setShowViewModal]);
  const handleCloseEditModal = useCallback(() => setShowEditModal(false), [setShowEditModal]);


  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xl-down:py-7 lg-down:py-6 md-down:py-5 sm-down:py-4 xs-down:py-3 xl-down:px-3 md-down:px-2">
        {/* Stats Cards */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0}>
          <StatsCards stats={stats} />
        </LazyLoad>

        {/* View Toggle */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100}>
          <div className="flex items-center justify-between gap-4 flex-wrap xl-down:gap-3 md-down:gap-2.5 mb-6 xl-down:mb-5 lg-down:mb-4 md-down:mb-4 sm-down:mb-3 xs-down:mb-3">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <button
              onClick={() => setShowTagManagementModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg xl-down:px-3.5 xl-down:py-1.5 lg-down:px-3 lg-down:py-1.5 md-down:px-2.5 md-down:py-1 sm-down:text-sm sm-down:px-2 sm-down:py-1 xs-down:text-xs xs-down:px-1.5 xs-down:py-0.5 xs-down:gap-1 mt-0 xl-down:mt-2 md-down:mt-1"
            >
              <svg className="w-5 h-5 xl-down:w-4.5 xl-down:h-4.5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5 xs-down:w-3 xs-down:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{t('tags.manage')}</span>
            </button>
          </div>
        </LazyLoad>

        {/* Conditional rendering based on viewMode */}
        {viewMode === 'tags' ? (
          // Tags View
          <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300}>
            <TagsView
              onView={openView}
              onEdit={openEdit}
              onArchive={confirmArchiveNote}
              onDelete={confirmDeleteNote}
              toggleSelect={toggleSelect}
              selectedIds={selectedIds}
              onPinUpdate={handlePinUpdate}
              acknowledgeReminderNote={acknowledgeReminderNote}
              getPriorityColor={getPriorityColor}
              getPriorityText={getPriorityText}
            />
          </LazyLoad>
        ) : viewMode === 'folders' ? (
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
                onPinUpdate={handlePinUpdate}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
                currentPage={folderCurrentPage}
                totalPages={folderNotesPagination.totalPages}
                onPageChange={(page) => {
                  if (selectedFolder) {
                    fetchFolderNotes(selectedFolder.id, page);
                  }
                }}
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
                onPinFolder={handlePinFolder}
                onUnpinFolder={handleUnpinFolder}
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
                showArchived={viewMode === 'archived'}
                categories={categories}
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
                onPinUpdate={handlePinUpdate}
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
        categories={categories}
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
        categories={categories}
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
          categories={folderCategories}
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
          categories={folderCategories}
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

      {/* Tag Management Modal */}
      <TagManagementModal
        isOpen={showTagManagementModal}
        onClose={() => setShowTagManagementModal(false)}
      />
  </div>
);
};
export default Dashboard;
