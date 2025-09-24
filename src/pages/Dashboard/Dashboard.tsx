import { 
  Plus, 
  Search, 
  Archive, 
  ArchiveRestore,
  Trash2, 
  Star,
  BarChart3,
  StickyNote,
  Clock,
  Check,
  Pencil,
  Bell,
  Eye,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/pages/Dashboard/hooks/useDashboard';
import { formatDateMDYY } from '@/utils/utils';
import toast from 'react-hot-toast';
import { chatService, type ChatListItem } from '@/services/chatService';
import { groupService, type GroupSummary } from '@/services/groupService';

const Dashboard = () => {
  const {
    t,
    notes, isLoading, stats,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedPriority, setSelectedPriority,
    showArchived, setShowArchived,
    showCreateModal, setShowCreateModal,
    newNote, setNewNote,
    selectedIds, toggleSelect, clearSelection, confirmBulkDelete,
    showEditModal, setShowEditModal,
    editNote, setEditNote,
    handleCreateNote, handleArchiveNote, confirmDeleteNote, openEdit, handleUpdateNote,
    getPriorityColor, getPriorityText,
    dueReminderNoteIds,
    acknowledgeReminderNote,
    // view
    showViewModal, setShowViewModal, viewNote, openView,
  } = useDashboard();

  // Share state for Note Detail modal
  const [shareMode, setShareMode] = useState<'user' | 'group'>('user');
  const [friends, setFriends] = useState<ChatListItem[]>([]);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');

  useEffect(() => {
    if (!showViewModal) return;
    // Load recipients when opening modal
    (async () => {
      try {
        const [chatListRes, groupsRes] = await Promise.all([
          chatService.getChatList().catch(() => ({ data: [] })),
          groupService.listMyGroups().catch(() => ({ success: true, data: [] })),
        ]);
        const chatList: ChatListItem[] = chatListRes.data || [];
        const myGroups: GroupSummary[] = (groupsRes as any).data || [];
        setFriends(chatList);
        setGroups(myGroups);
      } catch {
        // ignore errors silently; UI will still allow manual typing later if needed
      }
    })();
  }, [showViewModal]);

  // (removed unused shareContent)

  const handleShare = async () => {
    if (!viewNote) return;
    try {
      const contentToSend = (() => {
        const payload = {
          type: 'note',
          v: 1,
          id: viewNote.id,
          title: viewNote.title,
          content: viewNote.content || '',
          imageUrl: viewNote.imageUrl || null,
          category: viewNote.category,
          priority: viewNote.priority,
          createdAt: viewNote.createdAt,
        };
        return 'NOTE_SHARE::' + encodeURIComponent(JSON.stringify(payload));
      })();

      if (shareMode === 'user') {
        if (!selectedUserId || typeof selectedUserId !== 'number') {
          toast.error(t('modals.view.share.selectFriend'));
          return;
        }
        await chatService.sendMessage(selectedUserId, contentToSend, 'text');
        toast.success(t('chat.success.sharedToUser'));
      } else {
        if (!selectedGroupId || typeof selectedGroupId !== 'number') {
          toast.error(t('modals.view.share.selectGroup'));
          return;
        }
        await groupService.sendGroupMessage(selectedGroupId, contentToSend, 'text');
        toast.success(t('chat.success.sharedToGroup'));
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        toast.error(t('chat.errors.shareForbidden'));
      } else {
        toast.error(t('chat.errors.shareFailed'));
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xl-down:py-7 lg-down:py-6 md-down:py-5 sm-down:py-4 xs-down:py-3 xl-down:px-3 md-down:px-2">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2 mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center lg-down:w-10 lg-down:h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8">
                <Star className="w-6 h-6 text-green-600 lg-down:w-5 lg-down:h-5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
              </div>
            </div>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.archived')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.archived}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center lg-down:w-10 lg-down:h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8">
                <Archive className="w-6 h-6 text-orange-600 lg-down:w-5 lg-down:h-5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
              </div>
            </div>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.uptime')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">100%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center lg-down:w-10 lg-down:h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8">
                <BarChart3 className="w-6 h-6 text-purple-600 lg-down:w-5 lg-down:h-5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3 mb-6 lg-down:mb-5 md-down:mb-4 sm-down:gap-2.5 xs-down:gap-2">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-2 rounded-xl border transition-all duration-200 lg-down:px-3.5 lg-down:py-1.5 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1 sm-down:text-sm xs-down:text-xs ${
              !showArchived
                ? 'bg-blue-600 text-white border-transparent shadow-sm'
                : 'bg-white/70 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-white/20 dark:border-gray-700/30'
            }`}
          >
            {t('view.active')}
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-4 py-2 rounded-xl border transition-all duration-200 lg-down:px-3.5 lg-down:py-1.5 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1 sm-down:text-sm xs-down:text-xs ${
              showArchived
                ? 'bg-blue-600 text-white border-transparent shadow-sm'
                : 'bg-white/70 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-white/20 dark:border-gray-700/30'
            }`}
          >
            {t('view.archived')}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 xl-down:gap-3.5 lg-down:gap-3 md-down:gap-2.5 sm-down:gap-2 xs-down:gap-1.5 mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 md-down:w-4 md-down:h-4" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:py-2.5 md-down:py-2.5 md-down:pl-9 sm-down:text-sm xs-down:text-xs"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 lg-down:gap-2.5 md-down:gap-2 sm-down:flex-col xs-down:gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white lg-down:px-3.5 lg-down:py-2.5 md-down:px-3 md-down:py-2 sm-down:text-sm xs-down:text-xs"
            >
              <option value="">{t('filters.allCategories')}</option>
              <option value="work">{t('filters.category.work')}</option>
              <option value="personal">{t('filters.category.personal')}</option>
              <option value="general">{t('filters.category.general')}</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white lg-down:px-3.5 lg-down:py-2.5 md-down:px-3 md-down:py-2 sm-down:text-sm xs-down:text-xs"
            >
              <option value="">{t('filters.allPriorities')}</option>
              <option value="high">{t('filters.priority.high')}</option>
              <option value="medium">{t('filters.priority.medium')}</option>
              <option value="low">{t('filters.priority.low')}</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 lg-down:px-5 lg-down:py-2.5 md-down:px-4 md-down:py-2 sm-down:text-sm sm-down:gap-1.5 xs-down:text-xs xs-down:px-3 xs-down:py-1.5"
            >
              <Plus className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
              {t('actions.createNote')}
            </button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-gray-700/30 mb-4 lg-down:p-3.5 md-down:p-3 sm-down:flex-col sm-down:gap-3 sm-down:items-start">
            <div className="text-sm text-gray-700 dark:text-gray-200 md-down:text-xs">
              {t('messages.selectedCount', { count: selectedIds.length })}
            </div>
            <div className="flex gap-2 sm-down:gap-1.5">
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm md-down:px-2.5 md-down:py-1 md-down:text-xs"
              >
                {t('actions.clearSelection')}
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-1 md-down:px-2.5 md-down:py-1 md-down:text-xs md-down:gap-0.5"
              >
                <Trash2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                {t('actions.deleteSelected')}
              </button>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 lg-down:py-10 md-down:py-8 sm-down:py-6">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin md-down:w-6 md-down:h-6 md-down:border-2"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-2 sm-down:gap-1.5">
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
                                   peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:shadow-md peer-checked:ring-2 peer-checked:ring-blue-500/30 sm-down:w-5 sm-down:h-5 xs-down:w-4 xs-down:h-4"
                      >
                        <Check strokeWidth={3} className="w-4 h-4 transition-all duration-150 transform scale-90
                                                        text-gray-500 dark:text-gray-400 opacity-70 group-hover:opacity-90
                                                        peer-checked:text-white peer-checked:opacity-100 peer-checked:scale-100 sm-down:w-3.5 sm-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                      </span>
                    </label>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 lg-down:text-base md-down:text-sm sm-down:text-sm">
                      {note.title}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {dueReminderNoteIds.includes(note.id) && (
                      <button
                        onClick={() => acknowledgeReminderNote(note.id)}
                        className="p-1 text-amber-500 sm-down:p-0.5"
                        title={t('actions.reminderDue')}
                      >
                        <Bell className="w-4 h-4 bell-strong md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => openView(note)}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200 sm-down:p-0.5"
                      title={t('actions.viewDetails')}
                    >
                      <Eye className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                    </button>
                    {showArchived ? (
                      <button
                        onClick={() => handleArchiveNote(note.id)}
                        title={t('actions.restore')}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200 sm-down:p-0.5"
                      >
                        <ArchiveRestore className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchiveNote(note.id)}
                        title={t('actions.archive')}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors duration-200 sm-down:p-0.5"
                      >
                        <Archive className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(note)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200 sm-down:p-0.5"
                      title={t('actions.edit')}
                    >
                      <Pencil className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                    </button>
                    <button
                      onClick={() => confirmDeleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 sm-down:p-0.5"
                    >
                      <Trash2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 md-down:text-xs sm-down:mb-3 xs-down:mb-2.5">
                  {note.content || t('messages.noContent')}
                </p>

                {note.imageUrl && (
                  <div className="mb-4 sm-down:mb-3 xs-down:mb-2.5">
                    <img src={note.imageUrl} alt={note.title} className="w-full h-40 object-cover rounded-xl border lg-down:h-36 md-down:h-32 sm-down:h-28 xs-down:h-24" />
                  </div>
                )}

                <div className="flex items-center justify-between sm-down:flex-col sm-down:gap-2 sm-down:items-start">
                  <div className="flex gap-2 sm-down:gap-1.5 xs-down:gap-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(note.priority)} xs-down:px-1.5 xs-down:py-0.5 xs-down:text-[10px]`}>
                      {getPriorityText(note.priority)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 xs-down:px-1.5 xs-down:py-0.5 xs-down:text-[10px]">
                      {t(`category.${note.category}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 xs-down:text-[10px]">
                    <Clock className="w-3 h-3 xs-down:w-2.5 xs-down:h-2.5" />
                    {formatDateMDYY(note.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && !isLoading && (
          <div className="text-center py-12 lg-down:py-10 md-down:py-8 sm-down:py-6 xs-down:py-5">
            <StickyNote className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 lg-down:w-14 lg-down:h-14 md-down:w-12 md-down:h-12 sm-down:w-10 sm-down:h-10 sm-down:mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 lg-down:text-base md-down:text-sm sm-down:mb-1.5">
              {showArchived ? t('messages.noArchived') : t('messages.noNotes')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 md-down:text-sm sm-down:text-sm sm-down:mb-3">
              {showArchived ? t('messages.switchToActive') : t('messages.createFirst')}
            </p>
            {!showArchived && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 lg-down:px-3.5 lg-down:py-1.5 md-down:px-3 md-down:text-sm sm-down:gap-1.5 xs-down:text-xs xs-down:px-2.5"
              >
                <Plus className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('modals.create.fields.image')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const { uploadService } = await import('@/services/uploadService');
                        const { url } = await uploadService.uploadImage(file);
                        setNewNote({ ...newNote, imageUrl: url });
                      } catch (_err) {
                        // ignore here; toasts handled in uploadService callers elsewhere if needed
                      }
                    }}
                    className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {newNote.imageUrl && (
                    <img src={newNote.imageUrl} alt="preview" className="w-12 h-12 rounded-md object-cover border" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
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

              {/* Reminder datetime */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('modals.create.fields.reminderAt')}
                </label>
                <input
                  type="datetime-local"
                  value={newNote.reminderAtLocal}
                  onChange={(e) => setNewNote({ ...newNote, reminderAtLocal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('modals.create.fields.reminderHint')}</p>
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

      {/* View Note Modal */}
      {showViewModal && viewNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('modals.view.title')}</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={t('actions.close')}>✕</button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewNote.title}</h3>
                <div className="mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{viewNote.content || t('messages.noContent')}</div>
              </div>

              {viewNote.imageUrl && (
                <img src={viewNote.imageUrl} alt={viewNote.title} className="w-full max-h-80 object-contain rounded-xl border" />
              )}

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-lg border ${getPriorityColor(viewNote.priority)}`}>{getPriorityText(viewNote.priority)}</span>
                <span className="px-2 py-1 rounded-lg border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">{t(`category.${viewNote.category}`)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {formatDateMDYY(viewNote.createdAt)}
              </div>

              <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('modals.view.share.title')}</h4>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="shareMode" checked={shareMode==='user'} onChange={() => setShareMode('user')} />
                      <span>{t('modals.view.share.modeUser')}</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="shareMode" checked={shareMode==='group'} onChange={() => setShareMode('group')} />
                      <span>{t('modals.view.share.modeGroup')}</span>
                    </label>
                  </div>
                  {shareMode === 'user' ? (
                    <select
                      value={selectedUserId as any}
                      onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('modals.view.share.selectFriend')}</option>
                      {friends.map((it) => (
                        <option key={it.friend.id} value={it.friend.id}>{it.friend.name} {it.unreadCount ? `(${it.unreadCount})` : ''}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={selectedGroupId as any}
                      onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : '')}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('modals.view.share.selectGroup')}</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  )}
                  <button onClick={handleShare} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t('modals.view.share.shareButton')}</button>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t('modals.view.share.hint')}</div>

                {/* Share preview card matching note list UI */}
                <div className="mt-4 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{viewNote.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{viewNote.content || t('messages.noContent')}</p>
                  {viewNote.imageUrl && (
                    <div className="mb-4">
                      <img src={viewNote.imageUrl} alt={viewNote.title} className="w-full h-40 object-cover rounded-xl border" />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(viewNote.priority)}`}>{getPriorityText(viewNote.priority)}</span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600">{t(`category.${viewNote.category}`)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDateMDYY(viewNote.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {t('actions.close')}
                </button>
              </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('modals.create.fields.image')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const { uploadService } = await import('@/services/uploadService');
                        const { url } = await uploadService.uploadImage(file);
                        setEditNote({ ...editNote, imageUrl: url });
                      } catch (_err) {
                        // ignore
                      }
                    }}
                    className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {editNote.imageUrl && (
                    <img src={editNote.imageUrl} alt="preview" className="w-12 h-12 rounded-md object-cover border" />
                  )}
                </div>
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

              {/* Reminder datetime */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('modals.create.fields.reminderAt')}
                </label>
                <input
                  type="datetime-local"
                  value={editNote.reminderAtLocal}
                  onChange={(e) => setEditNote({ ...editNote, reminderAtLocal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('modals.create.fields.reminderHint')}</p>
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
