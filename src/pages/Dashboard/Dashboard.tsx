import { useState } from 'react';
import { useDashboard } from '@/pages/Dashboard/hooks/useDashboard';
import { useBodyScrollLock } from '@/pages/Dashboard/hooks/useBodyScrollLock';
import ShareNoteModal from '@/components/ShareNoteModal';
import StatsCards from '@/pages/Dashboard/components/StatsCards';
import ViewToggle from '@/pages/Dashboard/components/ViewToggle';
import SearchAndFilters from '@/pages/Dashboard/components/SearchAndFilters';
import BulkActionsBar from '@/pages/Dashboard/components/BulkActionsBar';
import NotesGrid from '@/pages/Dashboard/components/NotesGrid';
import CreateNoteModal from '@/pages/Dashboard/components/CreateNoteModal';
import ViewNoteModal from '@/pages/Dashboard/components/ViewNoteModal';
import EditNoteModal from '@/pages/Dashboard/components/EditNoteModal';
import LazyLoad from '@/components/LazyLoad';

const Dashboard = () => {
  const {
    notes, isLoading, stats, pagination,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedPriority, setSelectedPriority,
    showArchived, setShowArchived,
    currentPage, setCurrentPage,
    showCreateModal, setShowCreateModal,
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

  // Share Note Modal state  
  const [showShareModal, setShowShareModal] = useState(false);

  // Disable body scroll when modals are open
  useBodyScrollLock(showViewModal || showEditModal || showShareModal || showCreateModal);

  const handleOpenShareModal = () => {
    setShowShareModal(true);
  };

  const handleShareSuccess = () => {
    // Optionally refresh notes or update UI
    setShowViewModal(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xl-down:py-7 lg-down:py-6 md-down:py-5 sm-down:py-4 xs-down:py-3 xl-down:px-3 md-down:px-2">
        {/* Stats Cards */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0}>
          <StatsCards stats={stats} />
        </LazyLoad>

        {/* View Toggle */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100}>
          <ViewToggle showArchived={showArchived} setShowArchived={setShowArchived} />
        </LazyLoad>

        {/* Controls */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={200}>
          <SearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
            onCreateNote={() => setShowCreateModal(true)}
          />
        </LazyLoad>

        <BulkActionsBar
          selectedCount={selectedIds.length}
          showArchived={showArchived}
          onClearSelection={clearSelection}
          onBulkDelete={confirmBulkDelete}
        />

        {/* Notes Grid */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={400}>
          <NotesGrid
            notes={notes}
            isLoading={isLoading}
            showArchived={showArchived}
            selectedIds={selectedIds}
            dueReminderNoteIds={dueReminderNoteIds}
            onToggleSelect={toggleSelect}
            onView={openView}
            onEdit={openEdit}
            onArchive={confirmArchiveNote}
            onDelete={confirmDeleteNote}
            onAcknowledgeReminder={acknowledgeReminderNote}
            onCreateNote={() => setShowCreateModal(true)}
            getPriorityColor={getPriorityColor}
            getPriorityText={getPriorityText}
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        </LazyLoad>
      </div>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newNote={newNote}
        setNewNote={(note) => setNewNote(note)}
        onSubmit={handleCreateNote}
      />

      {/* View Note Modal */}
      <ViewNoteModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        note={viewNote}
        onOpenShare={handleOpenShareModal}
        getPriorityColor={getPriorityColor}
        getPriorityText={getPriorityText}
      />
      {/* Edit Note Modal */}
      <EditNoteModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editNote={editNote}
        setEditNote={(note) => setEditNote(note)}
        onSubmit={handleUpdateNote}
      />

      {/* Share Note Modal */}
      <ShareNoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        note={viewNote}
        onSuccess={handleShareSuccess}
      />
  </div>
);
};
export default Dashboard;
