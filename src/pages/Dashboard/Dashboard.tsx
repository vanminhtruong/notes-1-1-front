import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import toast from 'react-hot-toast';
import { fetchNotes, fetchNoteStats, createNote, deleteNote, archiveNote, setFilters, updateNote } from '@/store/slices/notesSlice';
import { socketService } from '@/services/socketService';
import { 
  Plus, 
  Search, 
  Archive, 
  ArchiveRestore,
  Trash2, 
  Star,
  BookOpen,
  BarChart3,
  StickyNote,
  Clock,
  Check,
  Pencil
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t, i18n } = useTranslation('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNote, setEditNote] = useState({
    id: 0,
    title: '',
    content: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const dispatch = useAppDispatch();
  const { notes, isLoading, stats } = useAppSelector((state) => state.notes);

  useEffect(() => {
    // Keep global filters in sync for realtime socket refresh
    dispatch(setFilters({
      search: searchTerm,
      category: selectedCategory,
      priority: selectedPriority,
      isArchived: showArchived,
    }));

    dispatch(fetchNotes({ 
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
    dispatch(fetchNoteStats());
  }, [dispatch, searchTerm, selectedCategory, selectedPriority, showArchived]);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    socketService.connect();

    return () => {
      // Disconnect when component unmounts
      socketService.disconnect();
    };
  }, []);

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;

    await dispatch(createNote(newNote));
    setNewNote({ title: '', content: '', category: 'general', priority: 'medium' });
    setShowCreateModal(false);
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const handleDeleteNote = async (id: number) => {
    await dispatch(deleteNote(id));
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const confirmDeleteNote = (id: number) => {
    const tId = toast.custom((toastData) => (
      <div className={`max-w-sm w-full rounded-xl shadow-lg border ${
        toastData.visible ? 'animate-enter' : 'animate-leave'
      } bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold">{t('modals.confirm.deleteTitle')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('modals.confirm.irreversible')}</p>
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
              await handleDeleteNote(id);
              toast.dismiss(toastData.id);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {t('actions.delete')}
          </button>
        </div>
      </div>
    ), { duration: 8000 });
    return tId;
  };

  const handleArchiveNote = async (id: number) => {
    await dispatch(archiveNote(id));
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const openEdit = (note: typeof notes[number]) => {
    setEditNote({
      id: note.id,
      title: note.title || '',
      content: note.content || '',
      category: note.category || 'general',
      priority: (note.priority as 'low' | 'medium' | 'high') || 'medium',
    });
    setShowEditModal(true);
  };

  const handleUpdateNote = async () => {
    if (!editNote.title.trim()) return;
    await dispatch(updateNote({
      id: editNote.id,
      data: {
        title: editNote.title,
        content: editNote.content,
        category: editNote.category,
        priority: editNote.priority,
      },
    }));
    setShowEditModal(false);
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await Promise.all(selectedIds.map((id) => dispatch(deleteNote(id))));
    setSelectedIds([]);
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const confirmBulkDelete = () => {
    const tId = toast.custom((toastData) => (
      <div className={`max-w-sm w-full rounded-xl shadow-lg border ${
        toastData.visible ? 'animate-enter' : 'animate-leave'
      } bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold">{t('modals.confirm.bulkDeleteTitle')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('modals.confirm.irreversible')}</p>
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
              await handleBulkDelete();
              toast.dismiss(toastData.id);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {t('actions.delete')}
          </button>
        </div>
      </div>
    ), { duration: 8000 });
    return tId;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return t('priority.high');
      case 'medium': return t('priority.medium');
      case 'low': return t('priority.low');
      default: return t('priority.medium');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('stats.archived')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.archived}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Archive className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('stats.uptime')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
              !showArchived
                ? 'bg-blue-600 text-white border-transparent shadow-sm'
                : 'bg-white/70 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-white/20 dark:border-gray-700/30'
            }`}
          >
            {t('view.active')}
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
              showArchived
                ? 'bg-blue-600 text-white border-transparent shadow-sm'
                : 'bg-white/70 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-white/20 dark:border-gray-700/30'
            }`}
          >
            {t('view.archived')}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
            >
              <option value="">{t('filters.allCategories')}</option>
              <option value="work">{t('filters.category.work')}</option>
              <option value="personal">{t('filters.category.personal')}</option>
              <option value="general">{t('filters.category.general')}</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
            >
              <option value="">{t('filters.allPriorities')}</option>
              <option value="high">{t('filters.priority.high')}</option>
              <option value="medium">{t('filters.priority.medium')}</option>
              <option value="low">{t('filters.priority.low')}</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              {t('actions.createNote')}
            </button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-gray-700/30 mb-4">
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {t('messages.selectedCount', { count: selectedIds.length })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                {t('actions.clearSelection')}
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                {t('actions.deleteSelected')}
              </button>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-2">
                    <label className="mt-1 inline-flex items-center cursor-pointer select-none group" title={t('actions.selectNote')}>
                      <input
                        type="checkbox"
                        aria-label={t('actions.selectNote')}
                        checked={selectedIds.includes(note.id)}
                        onChange={() => toggleSelect(note.id)}
                        className="peer sr-only"
                      />
                      <span
                        className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white dark:bg-gray-800 shadow-sm transition-all
                                   peer-focus:ring-2 peer-focus:ring-blue-500
                                   hover:border-blue-400 hover:shadow group-active:scale-95
                                   peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:shadow-md peer-checked:ring-2 peer-checked:ring-blue-500/30"
                      >
                        <Check strokeWidth={3} className="w-4 h-4 transition-all duration-150 transform scale-90
                                                        text-gray-500 dark:text-gray-400 opacity-70 group-hover:opacity-90
                                                        peer-checked:text-white peer-checked:opacity-100 peer-checked:scale-100" />
                      </span>
                    </label>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {note.title}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {showArchived ? (
                      <button
                        onClick={() => handleArchiveNote(note.id)}
                        title={t('actions.restore')}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchiveNote(note.id)}
                        title={t('actions.archive')}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors duration-200"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(note)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title={t('actions.edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDeleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {note.content || t('messages.noContent')}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(note.priority)}`}>
                      {getPriorityText(note.priority)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600">
                      {t(`category.${note.category}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString(i18n.language)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <StickyNote className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {showArchived ? t('messages.noArchived') : t('messages.noNotes')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {showArchived ? t('messages.switchToActive') : t('messages.createFirst')}
            </p>
            {!showArchived && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                {t('actions.createNote')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('modals.create.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('modals.create.fields.title')}
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder={t('modals.create.fields.titlePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('modals.create.fields.content')}
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder={t('modals.create.fields.contentPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('modals.create.fields.category')}
                  </label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="general">{t('category.general')}</option>
                    <option value="work">{t('category.work')}</option>
                    <option value="personal">{t('category.personal')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('modals.create.fields.priority')}
                  </label>
                  <select
                    value={newNote.priority}
                    onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">{t('priority.low')}</option>
                    <option value="medium">{t('priority.medium')}</option>
                    <option value="high">{t('priority.high')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={handleCreateNote}
                disabled={!newNote.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {t('actions.createNote')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('modals.edit.title')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('modals.create.fields.title')}
                </label>
                <input
                  type="text"
                  value={editNote.title}
                  onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder={t('modals.create.fields.titlePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('modals.create.fields.content')}
                </label>
                <textarea
                  value={editNote.content}
                  onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder={t('modals.create.fields.contentPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('modals.create.fields.category')}
                  </label>
                  <select
                    value={editNote.category}
                    onChange={(e) => setEditNote({ ...editNote, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="general">{t('category.general')}</option>
                    <option value="work">{t('category.work')}</option>
                    <option value="personal">{t('category.personal')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('modals.create.fields.priority')}
                  </label>
                  <select
                    value={editNote.priority}
                    onChange={(e) => setEditNote({ ...editNote, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">{t('priority.low')}</option>
                    <option value="medium">{t('priority.medium')}</option>
                    <option value="high">{t('priority.high')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={handleUpdateNote}
                disabled={!editNote.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {t('actions.update')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
