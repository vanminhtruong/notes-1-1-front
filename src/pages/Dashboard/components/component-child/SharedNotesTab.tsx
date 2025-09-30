import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Inbox, ArrowDownUp, RefreshCw } from 'lucide-react';
import { SharedNoteItem } from './SharedNoteItem';
import { useSharedNotes } from '../../hooks/useSharedNotes';
import type { SharedNotesTabProps } from '../interface/SharedNotes.interface';
import toast from 'react-hot-toast';
import { notesService } from '@/services/notesService';
import EditSharedNoteModal from '@/components/EditSharedNoteModal';
import ViewSharedNoteModal from '~/pages/Dashboard/components/component-child/ViewSharedNoteModal';

export const SharedNotesTab = ({ searchTerm, currentUserId }: SharedNotesTabProps) => {
  const { t } = useTranslation('dashboard');
  const [subTab, setSubTab] = useState<'received' | 'sent'>('received');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<any>(null);
  const [editingNote, setEditingNote] = useState<any>(null);
  
  const {
    sharedWithMe,
    sharedByMe,
    isLoading,
    error,
    refreshSharedNotes,
    removeSharedNote,
    hasMore,
    loadMore,
  } = useSharedNotes();

  const handleViewNote = async (noteId: number) => {
    try {
      const resp = await notesService.getNoteById(noteId);
      const note = resp.note;
      setViewingNote({
        id: note.id,
        title: note.title,
        content: note.content,
        imageUrl: note.imageUrl,
        category: note.category,
        priority: note.priority,
        createdAt: note.createdAt,
      });
      setIsViewModalOpen(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('sharedNotes.errors.fetchFailed'));
    }
  };

  const handleEditNote = async (noteId: number) => {
    try {
      const permissions = await notesService.getSharedNotePermissions(noteId);
      if (!permissions?.canEdit) {
        toast.error(t('notes.editError') || 'Bạn không có quyền chỉnh sửa ghi chú này');
        return;
      }
      const resp = await notesService.getNoteById(noteId);
      const note = resp.note;
      setEditingNote({
        id: note.id,
        title: note.title,
        content: note.content,
        imageUrl: note.imageUrl,
        category: note.category,
        priority: note.priority,
        createdAt: note.createdAt,
      });
      setIsEditModalOpen(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('notes.editError'));
    }
  };

  const handleCreateFromNote = async (noteId: number) => {
    try {
      const permissions = await notesService.getSharedNotePermissions(noteId);
      if (!permissions?.canCreate) {
        toast.error(t('notes.createError') || 'Bạn không có quyền tạo ghi chú');
        return;
      }
      
      const resp = await notesService.getNoteById(noteId);
      const note = resp.note;
      
      // Find owner user id from sharedWithMe list
      const sharedNote = sharedWithMe.find(sn => sn.note.id === noteId);
      const ownerUserId = sharedNote?.sharedByUserId;
      
      if (!ownerUserId) {
        toast.error(t('notes.createError') || 'Không tìm thấy người gửi');
        return;
      }
      
      await toast.promise(
        notesService.createNote({
          title: (note.title || '').trim() || t('notes.untitled') || 'Ghi chú không tiêu đề',
          content: note.content || undefined,
          imageUrl: note.imageUrl ? String(note.imageUrl) : undefined,
          category: note.category,
          priority: note.priority,
          sharedFromUserId: ownerUserId,
        }),
        {
          loading: t('loading.creating') || 'Đang tạo ghi chú...',
          success: t('success.created') || 'Tạo ghi chú thành công',
          error: t('errors.createFailed') || 'Tạo ghi chú thất bại',
        }
      );
    } catch (error: any) {
      console.error('create via permission failed', error);
      toast.error(error?.response?.data?.message || t('errors.createFailed') || 'Tạo ghi chú thất bại');
    }
  };

  const handleNoteUpdated = () => {
    setIsEditModalOpen(false);
    setEditingNote(null);
    refreshSharedNotes();
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingNote(null);
  };

  // Additional real-time listener for immediate UI updates
  useEffect(() => {
    const handleSharedPermissionsUpdated = () => {
      console.log('🔄 Permissions updated, refreshing shared notes...');
      refreshSharedNotes();
    };

    const handleCreatePermissionsChanged = () => {
      console.log('🔄 Create permissions changed, refreshing shared notes...');
      refreshSharedNotes();
    };

    window.addEventListener('shared_permissions_updated', handleSharedPermissionsUpdated);
    window.addEventListener('create_permissions_changed', handleCreatePermissionsChanged);

    return () => {
      window.removeEventListener('shared_permissions_updated', handleSharedPermissionsUpdated);
      window.removeEventListener('create_permissions_changed', handleCreatePermissionsChanged);
    };
  }, [refreshSharedNotes]);

  // Filter based on search term
  const filteredReceivedNotes = useMemo(() => {
    if (!searchTerm.trim()) return sharedWithMe;
    
    const lowerSearch = searchTerm.toLowerCase();
    return sharedWithMe.filter(sn => 
      sn.note.title.toLowerCase().includes(lowerSearch) ||
      sn.note.content?.toLowerCase().includes(lowerSearch) ||
      sn.sharedByUser.name.toLowerCase().includes(lowerSearch)
    );
  }, [sharedWithMe, searchTerm]);

  const filteredSentNotes = useMemo(() => {
    if (!searchTerm.trim()) return sharedByMe;
    
    const lowerSearch = searchTerm.toLowerCase();
    return sharedByMe.filter(sn => 
      sn.note.title.toLowerCase().includes(lowerSearch) ||
      sn.note.content?.toLowerCase().includes(lowerSearch) ||
      sn.sharedWithUser.name.toLowerCase().includes(lowerSearch)
    );
  }, [sharedByMe, searchTerm]);

  const currentNotes = subTab === 'received' ? filteredReceivedNotes : filteredSentNotes;
  const hasMoreCurrent = subTab === 'received' ? hasMore.withMe : hasMore.byMe;
  const loadMoreCurrent = subTab === 'received' ? loadMore.withMe : loadMore.byMe;

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('received')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              subTab === 'received'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/70 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {t('sharedNotes.received')}
            {sharedWithMe.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                {sharedWithMe.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setSubTab('sent')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              subTab === 'sent'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/70 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {t('sharedNotes.sent')}
            {sharedByMe.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                {sharedByMe.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={refreshSharedNotes}
          disabled={isLoading}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50"
          title={t('sharedNotes.refresh')}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading && currentNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">{t('sharedNotes.loading')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 dark:text-red-400">
            <p className="text-sm">{error}</p>
          </div>
        ) : currentNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Inbox className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">
              {subTab === 'received' 
                ? t('sharedNotes.noReceivedNotes')
                : t('sharedNotes.noSentNotes')
              }
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {subTab === 'received'
                ? t('sharedNotes.noReceivedNotesDesc')
                : t('sharedNotes.noSentNotesDesc')
              }
            </p>
          </div>
        ) : (
          <>
            {currentNotes.map((sharedNote) => (
              <SharedNoteItem
                key={sharedNote.id}
                sharedNote={sharedNote}
                type={subTab === 'received' ? 'received' : 'sent'}
                onRemove={removeSharedNote}
                onViewNote={handleViewNote}
                onEditNote={handleEditNote}
                onCreateFromNote={handleCreateFromNote}
                currentUserId={currentUserId}
              />
            ))}

            {/* Load More Button */}
            {hasMoreCurrent && (
              <button
                onClick={loadMoreCurrent}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('sharedNotes.loadingMore')}
                  </>
                ) : (
                  <>
                    <ArrowDownUp className="w-4 h-4" />
                    {t('sharedNotes.loadMore')}
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {viewingNote && (
        <ViewSharedNoteModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          note={viewingNote}
        />
      )}

      {/* Edit Modal */}
      {editingNote && (
        <EditSharedNoteModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingNote(null);
          }}
          note={editingNote}
          onNoteUpdated={handleNoteUpdated}
        />
      )}
    </div>
  );
};
