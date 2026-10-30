import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Edit2, Trash2, Plus, Play } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { formatDateMDYY } from '@/utils/utils';
import { notesService } from '@/services/notesService';
import toast from 'react-hot-toast';
import { useConfirmationToast } from '../../../hooks/Manager-handle/useConfirmationToastHandler';
import EditSharedNoteModal from '@/components/EditSharedNoteModal';
import ViewSharedNoteModal from '@/pages/Dashboard/components/component-child/ViewSharedNoteModal';
import { extractYouTubeId } from '@/utils/youtube';
import { getHtmlPreview, sanitizeInlineHtml } from '@/utils/htmlUtils';

interface SharedNoteData {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  category?: string | { id: number; name: string; color: string; icon: string } | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  background?: string | null;
}

interface SharedNoteCardProps {
  note: SharedNoteData;
  isOwnMessage: boolean;
  compact?: boolean;
}

interface PermissionsResponse {
  canEdit: boolean;
  canDelete: boolean;
  isOwner?: boolean;
  isShared?: boolean;
  canCreate?: boolean;
}

const SharedNoteCard: React.FC<SharedNoteCardProps> = memo(({ note, isOwnMessage, compact = false }) => {
  const { t } = useTranslation('dashboard');
  const { confirmWithToast } = useConfirmationToast({ t });
  const [permissions, setPermissions] = useState<PermissionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<SharedNoteData>(note);
  const [ownerUserId, setOwnerUserId] = useState<number | undefined>(undefined);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Load permissions if this is not own message (i.e., received shared note)
  useEffect(() => {
    if (!isOwnMessage) {
      loadPermissions();
    }
  }, [note.id, isOwnMessage]);

  // Realtime: lắng nghe sự kiện cập nhật quyền chia sẻ từ socket (admin cập nhật)
  useEffect(() => {
    const refreshIfMatch = (detail: any) => {
      try {
        const nid = Number(detail?.noteId || detail?.sharedNote?.noteId || detail?.id);
        if (!Number.isNaN(nid)) {
          if (nid === Number(note.id)) {
            void loadPermissions();
          }
          return;
        }
        // Nếu payload không có noteId cụ thể, vẫn reload an toàn nhưng giới hạn tần suất
        void loadPermissions();
      } catch {
        void loadPermissions();
      }
    };

    const onSharedPerm = (e: Event) => refreshIfMatch((e as CustomEvent).detail);
    const onSharedWithMe = (e: Event) => refreshIfMatch((e as CustomEvent).detail);
    const onSharedByMe = (e: Event) => refreshIfMatch((e as CustomEvent).detail);
    const onCreatePermChanged = (e: Event) => refreshIfMatch((e as CustomEvent).detail);
    const onGroupSharedUpdatedByAdmin = (e: Event) => refreshIfMatch((e as CustomEvent).detail);
    const onGroupSharedUpdated = (e: Event) => refreshIfMatch((e as CustomEvent).detail);
    
    // Listen for note content updates
    const onNoteUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id === note.id) {
        // Update current note content
        setCurrentNote(prev => ({
          ...prev,
          title: detail.title || prev.title,
          content: detail.content || prev.content,
          imageUrl: detail.imageUrl || prev.imageUrl,
          videoUrl: detail.videoUrl || prev.videoUrl,
          youtubeUrl: detail.youtubeUrl || prev.youtubeUrl,
          priority: detail.priority || prev.priority,
          background: detail.background !== undefined ? detail.background : prev.background,
        }));
      }
    };

    // Note: When note is deleted, useChatSocket will automatically remove the message from chat
    // No need to update SharedNoteCard state - the component will be unmounted

    try {
      window.addEventListener('shared_permissions_updated', onSharedPerm as any);
      window.addEventListener('note_shared_with_me', onSharedWithMe as any);
      window.addEventListener('note_shared_by_me', onSharedByMe as any);
      window.addEventListener('create_permissions_changed', onCreatePermChanged as any);
      window.addEventListener('group_shared_note_updated_by_admin', onGroupSharedUpdatedByAdmin as any);
      window.addEventListener('group_shared_note_updated', onGroupSharedUpdated as any);
      window.addEventListener('note_updated', onNoteUpdated as any);
    } catch {}

    return () => {
      try { window.removeEventListener('shared_permissions_updated', onSharedPerm as any); } catch {}
      try { window.removeEventListener('note_shared_with_me', onSharedWithMe as any); } catch {}
      try { window.removeEventListener('note_shared_by_me', onSharedByMe as any); } catch {}
      try { window.removeEventListener('create_permissions_changed', onCreatePermChanged as any); } catch {}
      try { window.removeEventListener('group_shared_note_updated_by_admin', onGroupSharedUpdatedByAdmin as any); } catch {}
      try { window.removeEventListener('group_shared_note_updated', onGroupSharedUpdated as any); } catch {}
      try { window.removeEventListener('note_updated', onNoteUpdated as any); } catch {}
    };
  }, [note.id]);

  // Fetch latest note content so F5 vẫn thấy dữ liệu mới nhất (owner hoặc người nhận được cấp quyền)
  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      try {
        const resp = await notesService.getNoteById(note.id);
        if (!mounted) return;
        const n = resp.note;
        setCurrentNote({
          id: n.id,
          title: n.title,
          content: n.content || '',
          imageUrl: n.imageUrl || '',
          videoUrl: n.videoUrl || '',
          youtubeUrl: n.youtubeUrl || '',
          category: n.category,
          priority: n.priority,
          createdAt: n.createdAt,
          background: n.background || n.backgroundImage || n.backgroundColor || null,
        });
        // Lưu owner của ghi chú để phục vụ canCreate
        if (typeof n.userId === 'number') {
          setOwnerUserId(n.userId as number);
        }
      } catch (err: any) {
        // Nếu 403 (không có quyền) hoặc 404 thì giữ nguyên payload cũ, tránh chặn UI
        const status = err?.response?.status;
        if (status && status !== 403 && status !== 404) {
          // Chỉ thông báo lỗi khi không phải lỗi quyền hoặc không tồn tại
          toast.error(t('notes.loadError', 'Không thể tải ghi chú'));
        }
      }
    };
    fetchLatest();
    return () => { mounted = false; };
  }, [note.id]);

  const loadPermissions = async () => {
    try {
      console.log(`🔍 Loading permissions for note ${note.id}`);
      const response = await notesService.getSharedNotePermissions(note.id);
      console.log(`✅ Permissions loaded:`, response);
      setPermissions(response);
    } catch (error: any) {
      console.error('Error loading shared note permissions:', error);
      
      // Handle different error cases
      if (error?.response?.status === 404) {
        console.log(`📝 Note ${note.id} not found or not shared`);
      }
      
      // Always fallback to no permissions instead of crashing
      setPermissions({ 
        canEdit: false, 
        canDelete: false, 
        canCreate: false,
        isShared: false 
      });
    }
  };

  const handleEdit = async () => {
    // Check permissions first
    try {
      const latest = await notesService.getSharedNotePermissions(note.id);
      if (!latest.canEdit && !latest.isOwner) {
        toast.error(t('notes.editError') || 'Bạn không còn quyền chỉnh sửa ghi chú này');
        return;
      }
      
      // Open edit modal
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      toast.error(t('notes.editError') || 'Không thể mở chế độ chỉnh sửa');
    }
  };

  const handleNoteUpdated = (updatedNote: SharedNoteData) => {
    setCurrentNote(updatedNote);
  };

  const handleDelete = async () => {
    if (!await confirmWithToast(t('notes.confirmDelete') || 'Bạn có chắc muốn xóa ghi chú này?')) {
      return;
    }

    try {
      setIsLoading(true);

      // Always reload latest permissions in case they were changed recently
      let latest: PermissionsResponse | null = null;
      try {
        latest = await notesService.getSharedNotePermissions(note.id);
      } catch (e) {
        // ignore, we'll fallback to current permissions state
      }

      const eff = latest ?? permissions ?? { canEdit: false, canDelete: false };

      // If user has canDelete permission (owner or shared with canDelete), delete the note
      if (eff.canDelete) {
        await notesService.deleteNote(note.id);
        toast.success(t('notes.deleteSuccess') || 'Đã xóa ghi chú thành công');
        return;
      }

      // No permission
      toast.error(t('notes.deleteError') || 'Không thể xóa ghi chú — bạn không còn quyền xóa');
    } catch (error: any) {
      console.error('Error deleting shared note:', error);
      toast.error(error?.response?.data?.message || t('notes.deleteError') || 'Không thể xóa ghi chú');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityChip = (p: string) => {
    const base = 'px-2 py-1 text-xs font-medium rounded-lg border';
    switch (p) {
      case 'high':
        return `${base} bg-red-100 text-red-800 border-red-200`;
      case 'medium':
        return `${base} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case 'low':
      default:
        return `${base} bg-green-100 text-green-800 border-green-200`;
    }
  };

  const showActionButtons = !isOwnMessage && permissions && (permissions.canEdit || permissions.canDelete || permissions.canCreate);

  const handleCreateViaPermission = async () => {
    try {
      // Kiểm tra quyền mới nhất
      const p = await notesService.getSharedNotePermissions(note.id);
      if (!p?.canCreate || !ownerUserId) {
        toast.error(t('notes.createError') || 'Bạn không có quyền tạo ghi chú');
        return;
      }
      await toast.promise(
        notesService.createNote({
          title: (currentNote.title || '').trim() || t('notes.untitled') || 'Ghi chú không tiêu đề',
          content: currentNote.content || undefined,
          imageUrl: currentNote.imageUrl ? String(currentNote.imageUrl) : undefined,
          videoUrl: currentNote.videoUrl ? String(currentNote.videoUrl) : undefined,
          youtubeUrl: currentNote.youtubeUrl ? String(currentNote.youtubeUrl) : undefined,
          categoryId: typeof currentNote.category === 'object' && currentNote.category?.id ? currentNote.category.id : undefined,
          priority: currentNote.priority,
          sharedFromUserId: ownerUserId,
        }),
        {
          loading: t('loading.creating') || 'Đang tạo ghi chú...',
          success: t('success.created') || 'Tạo ghi chú thành công',
          error: t('errors.createFailed') || 'Tạo ghi chú thất bại',
        }
      );
    } catch (e: any) {
      console.error('create via permission failed', e);
      toast.error(e?.response?.data?.message || t('errors.createFailed') || 'Tạo ghi chú thất bại');
    }
  };

  // Classes theo chế độ compact
  const wrapPad = compact ? 'p-3' : 'p-6';
  const wrapMaxW = compact ? 'max-w-[320px]' : 'max-w-[360px]';
  const headerMb = compact ? 'mb-2' : 'mb-4';
  const descMb = compact ? 'mb-2' : 'mb-4';
  const imgMb = compact ? 'mb-2' : 'mb-4';
  const titleSize = compact ? 'text-base' : 'text-lg';
  const imgH = compact ? 'h-28' : 'h-40';
  const rightInfoMargin = compact ? 'ml-3' : '';

  // Determine if background is a color or image URL
  const isBackgroundImage = currentNote.background && (
    currentNote.background.startsWith('http') || 
    currentNote.background.startsWith('/') ||
    currentNote.background.startsWith('data:')
  );
  
  // Debug log
  console.log('🎨 SharedNoteCard - Background info:', {
    noteId: currentNote.id,
    background: currentNote.background,
    isBackgroundImage,
    hasBackground: !!currentNote.background
  });

  return (
    <>
    <div 
      className={`backdrop-blur-lg rounded-2xl ${wrapPad} border border-white/20 dark:border-gray-700/30 ${wrapMaxW} ${!currentNote.background ? 'bg-white/70 dark:bg-gray-800/90' : ''}`}
      style={currentNote.background ? (
        isBackgroundImage ? {
          backgroundImage: `url(${currentNote.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {
          backgroundColor: currentNote.background
        }
      ) : undefined}
    >
      <div className={`flex items-start justify-between gap-2 ${headerMb}`}>
        <h3 className={`${titleSize} font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0`}>
          {currentNote.title}
        </h3>
        {showActionButtons && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {permissions.canEdit && (
              <button
                onClick={handleEdit}
                disabled={isLoading}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title={t('notes.edit') || 'Chỉnh sửa'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {permissions.canDelete && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title={t('notes.delete') || 'Xóa'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {permissions.canCreate && (
              <button
                onClick={handleCreateViaPermission}
                disabled={isLoading}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title={t('actions.createNote') || 'Tạo ghi chú'}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div
        className={`text-gray-600 dark:text-gray-300 text-sm ${descMb}`}
        style={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          minWidth: 0
        }}
        title={getHtmlPreview(currentNote.content || '', 500)}
        dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(currentNote.content || '') }}
      />
      
      {currentNote.videoUrl ? (
        <div
          className={`${imgMb} relative z-10`}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
        >
          <video
            controls
            controlsList="nodownload"
            src={currentNote.videoUrl}
            preload="metadata"
            playsInline
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              const video = e.currentTarget;
              if (video.paused) {
                void video.play()?.catch(err => console.log('Play prevented:', err));
              } else {
                video.pause();
              }
            }}
            onMouseDown={(e) => e.stopPropagation()} 
            onContextMenu={(e) => e.stopPropagation()}
            onError={(e) => {
              try {
                const el = e.currentTarget;
                el.style.display = 'none';
                const wrap = el.parentElement;
                if (wrap) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full rounded-xl border p-3 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200';
                  fallback.innerHTML = `Không phát được video. <a href="${currentNote.videoUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">Mở trong tab mới</a>`;
                  wrap.appendChild(fallback);
                }
              } catch {}
            }}
            className={`w-full ${imgH} object-cover rounded-xl border cursor-pointer pointer-events-auto`}
            style={{ pointerEvents: 'auto' }}
          />
        </div>
      ) : currentNote.imageUrl ? (
        <div className={`${imgMb}`}>
          <img src={currentNote.imageUrl} alt={currentNote.title} className={`w-full ${imgH} object-cover rounded-xl border`} />
        </div>
      ) : currentNote.youtubeUrl && extractYouTubeId(currentNote.youtubeUrl) ? (
        <button
          type="button"
          className={`${imgMb} relative group w-full text-left`}
          onClick={(e) => { e.stopPropagation(); setIsViewModalOpen(true); }}
        >
          <img 
            src={`https://img.youtube.com/vi/${extractYouTubeId(currentNote.youtubeUrl)}/hqdefault.jpg`} 
            alt={currentNote.title} 
            className={`w-full ${imgH} object-cover rounded-xl border`} 
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <Play className="w-8 h-8 text-white" />
          </div>
        </button>
      ) : (
        <div className={`${imgMb} ${imgH}`} />
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={priorityChip(currentNote.priority)}>
            {currentNote.priority === 'high' ? t('priority.high') :
             currentNote.priority === 'medium' ? t('priority.medium') :
             t('priority.low')}
          </span>
          {currentNote.category && typeof currentNote.category === 'object' && currentNote.category.name ? (
            <span 
              className="px-2 py-1 text-xs font-medium rounded-lg border flex items-center gap-1.5"
              style={{ 
                backgroundColor: `${currentNote.category.color}15`,
                borderColor: currentNote.category.color,
                color: currentNote.category.color
              }}
            >
              {(() => {
                const Icon = (LucideIcons as any)[currentNote.category.icon] || LucideIcons.Tag;
                return <Icon className="w-3 h-3" style={{ color: currentNote.category.color }} />;
              })()}
              {currentNote.category.name}
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600">
              {typeof currentNote.category === 'string' ? t(`category.${currentNote.category}`) : t('category.general')}
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ${rightInfoMargin}`}>
          <Clock className="w-3 h-3" />
          {formatDateMDYY(currentNote.createdAt)}
        </div>
      </div>
    </div>

    {/* Edit Modal */}
    <EditSharedNoteModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      note={currentNote}
      onNoteUpdated={handleNoteUpdated}
    />

    {/* View Modal (for YouTube or full view) */}
    <ViewSharedNoteModal
      isOpen={isViewModalOpen}
      onClose={() => setIsViewModalOpen(false)}
      note={currentNote}
    />
  </>
  );
});

SharedNoteCard.displayName = 'SharedNoteCard';

export default SharedNoteCard;

