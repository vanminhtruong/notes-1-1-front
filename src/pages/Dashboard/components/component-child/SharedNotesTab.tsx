import { useState, useMemo, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Inbox, RefreshCw } from 'lucide-react';
import { SharedNoteItem } from './SharedNoteItem';
import { GroupSharedNoteItem } from './GroupSharedNoteItem';
import { useSharedNotesState } from '../../hooks/Manager-useState/useSharedNotesState';
import { useSharedNotesHandlers } from '../../hooks/Manager-handle/useSharedNotesHandlers';
import { useSharedNotesEffects } from '../../hooks/Manager-Effects/useSharedNotesEffects';
import type { SharedNotesTabProps } from '../interface/SharedNotes.interface';
import toast from 'react-hot-toast';
import { notesService } from '@/services/notesService';
import EditSharedNoteModal from '@/components/EditSharedNoteModal';
import ViewSharedNoteModal from '~/pages/Dashboard/components/component-child/ViewSharedNoteModal';
import Pagination from '@/components/Pagination';
import LazyLoad from '@/components/LazyLoad';
import './ChatWindow-child/chat-tabs.css';

export const SharedNotesTab = memo(({ searchTerm, currentUserId }: SharedNotesTabProps) => {
  const { t } = useTranslation('dashboard');
  const [subTab, setSubTab] = useState<'received' | 'sent' | 'groups'>('received');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<any>(null);
  const [editingNote, setEditingNote] = useState<any>(null);
  
  // Initialize hooks
  const sharedNotesState = useSharedNotesState();
  const sharedNotesHandlers = useSharedNotesHandlers({
    setIsLoading: sharedNotesState.setIsLoading,
    setError: sharedNotesState.setError,
    setSharedWithMe: sharedNotesState.setSharedWithMe,
    setSharedByMe: sharedNotesState.setSharedByMe,
    setGroupSharedNotes: sharedNotesState.setGroupSharedNotes,
    setTotalPagesWithMe: sharedNotesState.setTotalPagesWithMe,
    setTotalPagesByMe: sharedNotesState.setTotalPagesByMe,
    setTotalPagesGroups: sharedNotesState.setTotalPagesGroups,
    setTotalWithMe: sharedNotesState.setTotalWithMe,
    setTotalByMe: sharedNotesState.setTotalByMe,
    setTotalGroups: sharedNotesState.setTotalGroups,
    setPageWithMe: sharedNotesState.setPageWithMe,
    setPageByMe: sharedNotesState.setPageByMe,
    setPageGroups: sharedNotesState.setPageGroups,
    isLoading: sharedNotesState.isLoading,
  });
  
  useSharedNotesEffects({
    refreshSharedNotes: sharedNotesHandlers.refreshSharedNotes,
    fetchSharedWithMe: sharedNotesHandlers.fetchSharedWithMe,
    fetchSharedByMe: sharedNotesHandlers.fetchSharedByMe,
    fetchGroupSharedNotes: sharedNotesHandlers.fetchGroupSharedNotes,
    setSharedWithMe: sharedNotesState.setSharedWithMe,
    setSharedByMe: sharedNotesState.setSharedByMe,
    setGroupSharedNotes: sharedNotesState.setGroupSharedNotes,
  });

  // Destructure for easier access
  const {
    sharedWithMe,
    sharedByMe,
    groupSharedNotes,
    isLoading,
    error,
    pageWithMe,
    pageByMe,
    pageGroups,
    totalPagesWithMe,
    totalPagesByMe,
    totalPagesGroups,
    totalWithMe,
    totalByMe,
    totalGroups,
  } = sharedNotesState;
  
  const {
    refreshSharedNotes,
    removeSharedNote,
    changePageWithMe,
    changePageByMe,
    changePageGroups,
  } = sharedNotesHandlers;
  
  const pagination = {
    withMe: {
      currentPage: pageWithMe,
      totalPages: totalPagesWithMe,
      total: totalWithMe,
    },
    byMe: {
      currentPage: pageByMe,
      totalPages: totalPagesByMe,
      total: totalByMe,
    },
    groups: {
      currentPage: pageGroups,
      totalPages: totalPagesGroups,
      total: totalGroups,
    },
  };
  
  const changePage = {
    withMe: changePageWithMe,
    byMe: changePageByMe,
    groups: changePageGroups,
  };

  const handleViewNote = async (noteId: number) => {
    try {
      const resp = await notesService.getNoteById(noteId);
      const note = resp.note;
      setViewingNote({
        id: note.id,
        title: note.title,
        content: note.content,
        imageUrl: note.imageUrl,
        videoUrl: note.videoUrl,
        youtubeUrl: note.youtubeUrl,
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
        videoUrl: note.videoUrl,
        youtubeUrl: note.youtubeUrl,
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
      
      // Find owner user id from sharedWithMe list OR groupSharedNotes list
      let ownerUserId: number | undefined;
      const sharedNote = sharedWithMe.find(sn => sn.note.id === noteId);
      if (sharedNote) {
        ownerUserId = sharedNote.sharedByUserId;
      } else {
        const groupSharedNote = groupSharedNotes.find(gsn => gsn.noteId === noteId);
        ownerUserId = groupSharedNote?.sharedByUserId;
      }
      
      if (!ownerUserId) {
        toast.error(t('notes.createError') || 'Không tìm thấy người gửi');
        return;
      }
      
      await toast.promise(
        notesService.createNote({
          title: (note.title || '').trim() || t('notes.untitled') || 'Ghi chú không tiêu đề',
          content: note.content || undefined,
          imageUrl: note.imageUrl ? String(note.imageUrl) : undefined,
          videoUrl: note.videoUrl ? String(note.videoUrl) : undefined,
          youtubeUrl: note.youtubeUrl ? String(note.youtubeUrl) : undefined,
          categoryId: note.category && typeof note.category === 'object' ? note.category.id : note.categoryId || undefined,
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

  const dismissGroupSharedNote = async (id: number) => {
    await notesService.dismissGroupSharedNote(id);
    // Update immediately, then refresh counts and pages from the server.
    sharedNotesState.setGroupSharedNotes(prev => prev.filter(item => item.id !== id));
    await sharedNotesHandlers.fetchGroupSharedNotes(1);
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

  const filteredGroupNotes = useMemo(() => {
    if (!searchTerm.trim()) return groupSharedNotes;
    
    const lowerSearch = searchTerm.toLowerCase();
    return groupSharedNotes.filter(gsn => 
      gsn.note.title.toLowerCase().includes(lowerSearch) ||
      gsn.note.content?.toLowerCase().includes(lowerSearch) ||
      gsn.group.name.toLowerCase().includes(lowerSearch) ||
      gsn.sharedByUser.name.toLowerCase().includes(lowerSearch)
    );
  }, [groupSharedNotes, searchTerm]);

  const currentNotes = subTab === 'received' ? filteredReceivedNotes : subTab === 'sent' ? filteredSentNotes : filteredGroupNotes;
  const currentPagination = subTab === 'received' ? pagination.withMe : subTab === 'sent' ? pagination.byMe : pagination.groups;
  const currentChangePage = subTab === 'received' ? changePage.withMe : subTab === 'sent' ? changePage.byMe : changePage.groups;

  return (
    <div className="ct flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="ct-seg-wrap">
        <div className="ct-seg" role="tablist">
          <button
            onClick={() => setSubTab('received')}
            aria-selected={subTab === 'received'}
            role="tab" className={`ct-seg-btn ${
              subTab === 'received'
                ? 'is-active'
                : ''
            }`}
          >
            {t('sharedNotes.received')}
            {totalWithMe > 0 && (
              <span className="ct-seg-count">
                {totalWithMe}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setSubTab('sent')}
            aria-selected={subTab === 'sent'}
            role="tab" className={`ct-seg-btn ${
              subTab === 'sent'
                ? 'is-active'
                : ''
            }`}
          >
            {t('sharedNotes.sent')}
            {totalByMe > 0 && (
              <span className="ct-seg-count">
                {totalByMe}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('groups')}
            aria-selected={subTab === 'groups'}
            role="tab" className={`ct-seg-btn ${
              subTab === 'groups'
                ? 'is-active'
                : ''
            }`}
          >
            {t('sharedNotes.groups') || 'Groups'}
            {totalGroups > 0 && (
              <span className="ct-seg-count">
                {totalGroups}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={refreshSharedNotes}
          disabled={isLoading}
          className="ct-icon-btn ct-refresh"
          title={t('sharedNotes.refresh')}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="ct-scroll ct-list ct-list--cards">
        {isLoading && currentNotes.length === 0 ? (
          <div className="ct-empty">
            <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: 'var(--ct-muted)' }} />
            <p className="ct-empty-desc">{t('sharedNotes.loading')}</p>
          </div>
        ) : error ? (
          <div className="ct-error">
            <p className="text-sm">{error}</p>
          </div>
        ) : currentNotes.length === 0 ? (
          <div className="ct-empty">
            <span className="ct-empty-icon"><Inbox className="w-8 h-8" strokeWidth={1.7} /></span>
            <p className="ct-empty-title">
              {subTab === 'received' 
                ? t('sharedNotes.noReceivedNotes')
                : subTab === 'sent'
                ? t('sharedNotes.noSentNotes')
                : (t('sharedNotes.noGroupNotes') || 'No group shared notes')
              }
            </p>
            <p className="ct-empty-desc">
              {subTab === 'received'
                ? t('sharedNotes.noReceivedNotesDesc')
                : subTab === 'sent'
                ? t('sharedNotes.noSentNotesDesc')
                : (t('sharedNotes.noGroupNotesDesc') || 'Notes shared in groups will appear here')
              }
            </p>
          </div>
        ) : (
          <>
            {subTab === 'groups' ? (
              // Render group shared notes with permissions UI
              (currentNotes as any[]).map((groupSharedNote, index) => (
                <LazyLoad
                  key={groupSharedNote.id}
                  threshold={0.1}
                  rootMargin="100px"
                  animationDuration={500}
                  delay={index * 50}
                  reAnimate={true}
                >
                  <GroupSharedNoteItem
                    groupSharedNote={groupSharedNote}
                    currentUserId={currentUserId}
                    onViewNote={handleViewNote}
                    onEditNote={handleEditNote}
                    onCreateFromNote={handleCreateFromNote}
                    onDeleteNote={async (noteId) => {
                      await notesService.deleteNote(noteId);
                    }}
                    onRemove={async (id) => {
                      await notesService.removeGroupSharedNote(id);
                      sharedNotesState.setGroupSharedNotes(prev => prev.filter(item => item.id !== id));
                      await sharedNotesHandlers.fetchGroupSharedNotes(1);
                    }}
                    onDismiss={dismissGroupSharedNote}
                  />
                </LazyLoad>
              ))
            ) : (
              // Render individual shared notes
              (currentNotes as any[]).map((sharedNote, index) => (
                <LazyLoad
                  key={sharedNote.id}
                  threshold={0.1}
                  rootMargin="100px"
                  animationDuration={500}
                  delay={index * 50}
                  reAnimate={true}
                >
                  <SharedNoteItem
                    sharedNote={sharedNote as any}
                    type={subTab === 'received' ? 'received' : 'sent'}
                    onRemove={(id) => removeSharedNote(id, subTab === 'received' ? 'received' : 'sent')}
                    onViewNote={handleViewNote}
                    onEditNote={handleEditNote}
                    onCreateFromNote={handleCreateFromNote}
                    currentUserId={currentUserId}
                  />
                </LazyLoad>
              ))
            )}
          </>
        )}
        </div>

        {/* Pagination */}
        {!isLoading && currentNotes.length > 0 && (
          <div className="ct-pager">
            <div className="scale-75 origin-center">
              <Pagination
                currentPage={currentPagination.currentPage}
                totalPages={currentPagination.totalPages}
                onPageChange={currentChangePage}
                className="mt-0"
              />
            </div>
          </div>
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
});

SharedNotesTab.displayName = 'SharedNotesTab';

