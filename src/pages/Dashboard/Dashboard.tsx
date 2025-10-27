import { useAppDispatch } from '@/store';
import { useTranslation } from 'react-i18next';

// Import hooks và components
import * as DashboardHooks from './hooks';

import {
  StatsCards, ViewToggle, SearchAndFilters, BulkActionsBar, NotesGrid,
  FoldersView, FolderNotesView, TagsView,
  CreateNoteModal, ViewNoteModal, EditNoteModal, CreateNoteInFolderModal, EditNoteInFolderModal,
  CreateFolderModal, EditFolderModal, MoveToFolderModal, MoveOutOfFolderModal,
  TagManagementModal, ShareNoteModal, LazyLoad,
} from '@/pages/Dashboard/import';

const Dashboard = () => {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();

  // State hooks
  const dashboardState = DashboardHooks.useDashboardState();
  const foldersState = DashboardHooks.useFoldersState();
  const viewModeState = DashboardHooks.useViewModeState();
  const modalsState = DashboardHooks.useModalsState();
  const folderNotesState = DashboardHooks.useFolderNotesState();
  const utilityHandlers = DashboardHooks.useUtilityHandlers();
  const categoryHandler = DashboardHooks.useCategoryHandler({
    setCategories: dashboardState.setCategories,
  });

  const foldersHandler = DashboardHooks.useFoldersHandler({
    setFolders: foldersState.setFolders,
    setIsLoading: foldersState.setIsLoading,
    setFolderNotes: foldersState.setFolderNotes,
    setIsFolderNotesLoading: foldersState.setIsFolderNotesLoading,
    setFolderNotesPagination: foldersState.setFolderNotesPagination,
    setCurrentPage: foldersState.setCurrentPage,
    selectedFolder: foldersState.selectedFolder,
    setSelectedFolder: foldersState.setSelectedFolder,
  });

  // Modals handler
  const modalsHandler = DashboardHooks.useModalsHandler({
    setShowShareModal: modalsState.setShowShareModal,
    setShowMoveToFolderModal: modalsState.setShowMoveToFolderModal,
    setNoteToMove: modalsState.setNoteToMove,
    setShowMoveOutOfFolderModal: modalsState.setShowMoveOutOfFolderModal,
    setNoteToMoveOut: modalsState.setNoteToMoveOut,
    setShowCreateFolderModal: modalsState.setShowCreateFolderModal,
    setShowEditFolderModal: modalsState.setShowEditFolderModal,
    setEditingFolder: modalsState.setEditingFolder,
  });

  // Folder notes handler
  const folderNotesHandler = DashboardHooks.useFolderNotesHandler({
    folderId: foldersState.selectedFolder?.id || null,
    newNote: folderNotesState.newNote,
    editNote: folderNotesState.editNote,
    setShowCreateModal: folderNotesState.setShowCreateModal,
    setNewNote: folderNotesState.setNewNote,
    setShowEditModal: folderNotesState.setShowEditModal,
    setEditNote: folderNotesState.setEditNote,
    onSuccess: () => {
      if (foldersState.selectedFolder) {
        foldersHandler.fetchFolderNotes(foldersState.selectedFolder.id);
      }
    },
  });

  // Category effects
  DashboardHooks.useCategoryEffects({
    categories: dashboardState.categories,
    setCategories: dashboardState.setCategories,
    newNoteCategoryId: dashboardState.newNote.categoryId,
    editNoteCategoryId: dashboardState.editNote.categoryId,
    moveToFront: utilityHandlers.moveToFront,
    loadCategories: categoryHandler.loadCategories,
  });

  // Dashboard handlers
  const dashboardHandlers = DashboardHooks.useDashboardHandlers({
    newNote: dashboardState.newNote,
    editNote: dashboardState.editNote,
    setShowCreateModal: dashboardState.setShowCreateModal,
    setNewNote: dashboardState.setNewNote,
    setShowEditModal: dashboardState.setShowEditModal,
    setEditNote: dashboardState.setEditNote,
    setShowViewModal: dashboardState.setShowViewModal,
    setViewNote: dashboardState.setViewNote,
    setCategories: dashboardState.setCategories,
    moveToFront: utilityHandlers.moveToFront,
    selectedIds: dashboardState.selectedIds,
    setSelectedIds: dashboardState.setSelectedIds,
  });

  // Folder handlers (existing useFolderHandlers - different from useFoldersHandler)
  const folderHandlers = DashboardHooks.useFolderHandlers({
    deleteFolder: foldersHandler.deleteFolder,
    fetchFolderNotes: foldersHandler.fetchFolderNotes,
    setSelectedFolder: foldersState.setSelectedFolder,
    confirmArchiveNote: dashboardHandlers.confirmArchiveNote,
    confirmDeleteNote: dashboardHandlers.confirmDeleteNote,
    moveNoteToFolder: foldersHandler.moveNoteToFolder,
    selectedFolder: foldersState.selectedFolder,
    currentPage: foldersState.currentPage,
  });

  // Move to folder handler
  const moveToFolderHandler = DashboardHooks.useMoveToFolderHandler({
    noteToMove: modalsState.noteToMove,
    moveNoteToFolder: foldersHandler.moveNoteToFolder,
    handleCloseMoveToFolder: modalsHandler.handleCloseMoveToFolder,
  });

  // Move out of folder handler
  const moveOutOfFolderHandler = DashboardHooks.useMoveOutOfFolderHandler({
    noteToMoveOut: modalsState.noteToMoveOut,
    moveNoteToFolder: foldersHandler.moveNoteToFolder,
    confirmArchiveNote: dashboardHandlers.confirmArchiveNote,
    handleCloseMoveOutOfFolder: modalsHandler.handleCloseMoveOutOfFolder,
    selectedFolder: foldersState.selectedFolder,
    fetchFolderNotes: foldersHandler.fetchFolderNotes,
    currentPage: foldersState.currentPage,
  });

  // Pin handlers
  const pinHandler = DashboardHooks.useDashboardPinHandler({
    pinFolder: foldersHandler.pinFolder,
    unpinFolder: foldersHandler.unpinFolder,
  });

  // Effects hooks
  DashboardHooks.useReminderEffects({ dueReminderNoteIds: dashboardState.dueReminderNoteIds });
  
  DashboardHooks.useViewModeEffects({
    viewMode: viewModeState.viewMode,
    setShowArchived: dashboardState.setShowArchived,
    setCurrentPage: dashboardState.setCurrentPage,
  });
  
  DashboardHooks.useFilterEffects({
    searchTerm: dashboardState.searchTerm,
    selectedCategory: dashboardState.selectedCategory,
    selectedPriority: dashboardState.selectedPriority,
    showArchived: dashboardState.showArchived,
    setCurrentPage: dashboardState.setCurrentPage,
  });

  DashboardHooks.useSocketListenersEffects({
    dispatch,
    currentPage: dashboardState.currentPage,
    searchTerm: dashboardState.searchTerm,
    selectedCategory: dashboardState.selectedCategory,
    selectedPriority: dashboardState.selectedPriority,
    viewMode: viewModeState.viewMode,
  });

  DashboardHooks.useLazyLoadDataEffects({
    dispatch,
    viewMode: viewModeState.viewMode,
    currentPage: dashboardState.currentPage,
    searchTerm: dashboardState.searchTerm,
    selectedCategory: dashboardState.selectedCategory,
    selectedPriority: dashboardState.selectedPriority,
    folders: foldersState.folders,
    fetchFolders: foldersHandler.fetchFolders,
    showMoveToFolderModal: modalsState.showMoveToFolderModal,
  });

  DashboardHooks.useLazyLoadCategoriesEffects({
    showCreateModal: dashboardState.showCreateModal,
    showEditModal: dashboardState.showEditModal,
    categories: dashboardState.categories,
    onCategoriesLoaded: dashboardState.setCategories,
  });

  DashboardHooks.useBodyScrollLockEffect(
    dashboardState.showViewModal || 
    dashboardState.showEditModal || 
    modalsState.showShareModal || 
    dashboardState.showCreateModal
  );

  // Modals handlers
  const modalsActionsHandler = DashboardHooks.useDashboardModalsHandler({
    setShowViewModal: dashboardState.setShowViewModal,
    setShowEditModal: dashboardState.setShowEditModal,
    setShowCreateModal: dashboardState.setShowCreateModal,
  });


  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xl-down:py-7 lg-down:py-6 md-down:py-5 sm-down:py-4 xs-down:py-3 xl-down:px-3 md-down:px-2">
        {/* Stats Cards */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0}>
          <StatsCards stats={dashboardState.stats} />
        </LazyLoad>

        {/* View Toggle */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100}>
          <div className="flex items-center justify-between gap-4 flex-wrap xl-down:gap-3 md-down:gap-2.5 mb-6 xl-down:mb-5 lg-down:mb-4 md-down:mb-4 sm-down:mb-3 xs-down:mb-3">
            <ViewToggle viewMode={viewModeState.viewMode} setViewMode={viewModeState.setViewMode} />
            <button
              onClick={() => dashboardState.setShowTagManagementModal(true)}
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
        {viewModeState.viewMode === 'tags' ? (
          // Tags View
          <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300}>
            <TagsView
              onView={dashboardHandlers.openView}
              onEdit={dashboardHandlers.openEdit}
              onArchive={dashboardHandlers.confirmArchiveNote}
              onDelete={dashboardHandlers.confirmDeleteNote}
              toggleSelect={dashboardHandlers.toggleSelect}
              selectedIds={dashboardState.selectedIds}
              onPinUpdate={pinHandler.handlePinUpdate}
              acknowledgeReminderNote={dashboardHandlers.acknowledgeReminderNote}
              getPriorityColor={dashboardHandlers.getPriorityColor}
              getPriorityText={dashboardHandlers.getPriorityText}
            />
          </LazyLoad>
        ) : viewModeState.viewMode === 'folders' ? (
          // Folders View
          foldersState.selectedFolder ? (
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300}>
              <FolderNotesView
                folder={foldersState.selectedFolder}
                notes={foldersState.folderNotes}
                isLoading={foldersState.isFolderNotesLoading}
                dueReminderNoteIds={dashboardState.dueReminderNoteIds}
                onBack={folderHandlers.handleBackFromFolder}
                onView={dashboardHandlers.openView}
                onEdit={folderNotesHandler.handleOpenEditModal}
                onArchive={folderHandlers.handleArchiveNoteInFolder as any}
                onDelete={folderHandlers.handleDeleteNoteInFolder as any}
                onAcknowledgeReminder={dashboardHandlers.acknowledgeReminderNote}
                onCreateNote={folderNotesHandler.handleOpenCreateModal}
                onRemoveFromFolder={folderHandlers.handleRemoveFromFolder}
                onMoveOutOfFolder={modalsHandler.handleOpenMoveOutOfFolder}
                onPinUpdate={pinHandler.handlePinUpdate}
                getPriorityColor={dashboardHandlers.getPriorityColor}
                getPriorityText={dashboardHandlers.getPriorityText}
                currentPage={foldersState.currentPage}
                totalPages={foldersState.folderNotesPagination.totalPages}
                onPageChange={(page) => {
                  if (foldersState.selectedFolder) {
                    foldersHandler.fetchFolderNotes(foldersState.selectedFolder.id, page);
                  }
                }}
              />
            </LazyLoad>
          ) : (
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300}>
              <FoldersView
                folders={foldersState.folders}
                isLoading={foldersState.isLoading}
                onCreateFolder={modalsHandler.handleOpenCreateFolderModal}
                onEditFolder={modalsHandler.handleOpenEditFolderModal}
                onDeleteFolder={folderHandlers.handleDeleteFolder}
                onViewFolder={folderHandlers.handleViewFolder}
                onPinFolder={pinHandler.handlePinFolder}
                onUnpinFolder={pinHandler.handleUnpinFolder}
              />
            </LazyLoad>
          )
        ) : (
          // Notes View (Active or Archived)
          <>
            {/* Controls */}
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={200}>
              <SearchAndFilters
                searchTerm={dashboardState.searchTerm}
                setSearchTerm={dashboardState.setSearchTerm}
                selectedCategory={dashboardState.selectedCategory}
                setSelectedCategory={dashboardState.setSelectedCategory}
                selectedPriority={dashboardState.selectedPriority}
                setSelectedPriority={dashboardState.setSelectedPriority}
                onCreateNote={modalsActionsHandler.handleOpenCreateModal}
                showArchived={viewModeState.viewMode === 'archived'}
                categories={dashboardState.categories}
                onLoadCategories={categoryHandler.loadCategories}
              />
            </LazyLoad>

            <BulkActionsBar
              selectedCount={dashboardState.selectedIds.length}
              showArchived={viewModeState.viewMode === 'archived'}
              onClearSelection={dashboardHandlers.clearSelection}
              onBulkDelete={dashboardHandlers.confirmBulkDelete}
            />

            {/* Notes Grid */}
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={400}>
              <NotesGrid
                notes={dashboardState.notes}
                isLoading={dashboardState.isLoading}
                showArchived={viewModeState.viewMode === 'archived'}
                selectedIds={dashboardState.selectedIds}
                dueReminderNoteIds={dashboardState.dueReminderNoteIds}
                onToggleSelect={dashboardHandlers.toggleSelect}
                onView={dashboardHandlers.openView}
                onEdit={dashboardHandlers.openEdit}
                onArchive={dashboardHandlers.confirmArchiveNote}
                onDelete={dashboardHandlers.confirmDeleteNote}
                onMoveToFolder={modalsHandler.handleOpenMoveToFolder}
                onPinUpdate={pinHandler.handlePinUpdate}
                onAcknowledgeReminder={dashboardHandlers.acknowledgeReminderNote}
                onCreateNote={modalsActionsHandler.handleOpenCreateModal}
                getPriorityColor={dashboardHandlers.getPriorityColor}
                getPriorityText={dashboardHandlers.getPriorityText}
                currentPage={dashboardState.currentPage}
                totalPages={dashboardState.notes.length < 9 ? dashboardState.currentPage : Math.max(1, Math.ceil(dashboardState.pagination.total / 9))}
                onPageChange={dashboardState.setCurrentPage}
              />
            </LazyLoad>
          </>
        )}
      </div>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={dashboardState.showCreateModal}
        onClose={modalsActionsHandler.handleCloseCreateModal}
        newNote={dashboardState.newNote}
        setNewNote={dashboardState.setNewNote}
        onSubmit={dashboardHandlers.handleCreateNote}
        categories={dashboardState.categories}
      />

      {/* View Note Modal */}
      <ViewNoteModal
        isOpen={dashboardState.showViewModal}
        onClose={modalsActionsHandler.handleCloseViewModal}
        note={dashboardState.viewNote}
        onOpenShare={modalsHandler.handleOpenShareModal}
        getPriorityColor={dashboardHandlers.getPriorityColor}
        getPriorityText={dashboardHandlers.getPriorityText}
      />

      {/* Edit Note Modal */}
      <EditNoteModal
        isOpen={dashboardState.showEditModal}
        onClose={modalsActionsHandler.handleCloseEditModal}
        editNote={dashboardState.editNote}
        setEditNote={dashboardState.setEditNote}
        onSubmit={dashboardHandlers.handleUpdateNote}
        categories={dashboardState.categories}
      />

      {/* Share Note Modal */}
      <ShareNoteModal
        isOpen={modalsState.showShareModal}
        onClose={modalsHandler.handleCloseShareModal}
        note={dashboardState.viewNote}
        onSuccess={modalsActionsHandler.handleShareSuccess}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={modalsState.showCreateFolderModal}
        onClose={modalsHandler.handleCloseCreateFolderModal}
        onSubmit={foldersHandler.createFolder as any}
      />

      {/* Edit Folder Modal */}
      <EditFolderModal
        isOpen={modalsState.showEditFolderModal}
        folder={modalsState.editingFolder}
        onClose={modalsHandler.handleCloseEditFolderModal}
        onSubmit={foldersHandler.updateFolder as any}
      />

      {/* Create Note in Folder Modal */}
      {foldersState.selectedFolder && (
        <CreateNoteInFolderModal
          isOpen={folderNotesState.showCreateModal}
          onClose={folderNotesHandler.handleCloseCreateModal}
          newNote={folderNotesState.newNote as any}
          setNewNote={folderNotesState.setNewNote}
          onSubmit={folderNotesHandler.handleCreateNote}
          folderName={foldersState.selectedFolder.name}
          categories={folderNotesState.categories}
        />
      )}

      {/* Edit Note in Folder Modal */}
      {foldersState.selectedFolder && (
        <EditNoteInFolderModal
          isOpen={folderNotesState.showEditModal}
          onClose={folderNotesHandler.handleCloseEditModal}
          editNote={folderNotesState.editNote as any}
          setEditNote={folderNotesState.setEditNote as any}
          onSubmit={folderNotesHandler.handleUpdateNote}
          folderName={foldersState.selectedFolder.name}
          categories={folderNotesState.categories}
        />
      )}

      {/* Move to Folder Modal */}
      <MoveToFolderModal
        isOpen={modalsState.showMoveToFolderModal}
        onClose={modalsHandler.handleCloseMoveToFolder}
        folders={foldersState.folders}
        onSelectFolder={moveToFolderHandler.handleSelectFolder}
        noteTitle={modalsState.noteToMove?.title || ''}
      />

      {/* Move Out of Folder Modal */}
      <MoveOutOfFolderModal
        isOpen={modalsState.showMoveOutOfFolderModal}
        onClose={modalsHandler.handleCloseMoveOutOfFolder}
        onMoveToActive={moveOutOfFolderHandler.handleMoveToActive}
        onMoveToArchived={moveOutOfFolderHandler.handleMoveToArchived}
        noteTitle={modalsState.noteToMoveOut?.title || ''}
      />

      {/* Tag Management Modal */}
      <TagManagementModal
        isOpen={dashboardState.showTagManagementModal}
        onClose={() => dashboardState.setShowTagManagementModal(false)}
      />
  </div>
);
};
export default Dashboard;
