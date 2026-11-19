import { FileText, User, Calendar, Edit2, Eye, Trash2, AlertCircle, Plus, CheckSquare, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import type { SharedNoteItemProps } from '../interface/SharedNotes.interface';
import { useEffect, useState, memo } from 'react';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import { notesService } from '@/services/notesService';
import { getTimeAgo } from '../../utils/timeUtils';
import { sanitizeInlineHtml, getHtmlPreview } from '@/utils/htmlUtils';
import './ChatWindow-child/chat-tabs.css';

export const SharedNoteItem = memo(({ sharedNote, type, onRemove, onViewNote, onEditNote, onCreateFromNote }: SharedNoteItemProps) => {
  const { t, i18n } = useTranslation('dashboard');
  const [isRemoving, setIsRemoving] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [localPermissions, setLocalPermissions] = useState({
    canEdit: sharedNote.canEdit,
    canDelete: sharedNote.canDelete,
    canCreate: sharedNote.canCreate,
  });
  const [isSaving, setIsSaving] = useState(false);
  const isReceived = type === 'received';
  const isSent = type === 'sent';
  const otherUser = isReceived ? sharedNote.sharedByUser : sharedNote.sharedWithUser;
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(otherUser?.avatar ?? null);

  // Nếu payload thiếu avatar, lấy bổ sung từ backend để hiển thị đúng
  useEffect(() => {
    let canceled = false;
    setAvatarUrl(otherUser?.avatar ?? null);
    if (!otherUser?.avatar && otherUser?.id) {
      (async () => {
        try {
          const res = await userService.getUserById(Number(otherUser.id));
          const url = res?.user?.avatar || null;
          if (!canceled) setAvatarUrl(url);
        } catch (_) {
          // silent fallback -> giữ icon mặc định
        }
      })();
    }
    return () => { canceled = true; };
  }, [otherUser?.id, otherUser?.avatar]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'ct-tag--high';
      case 'medium': return 'ct-tag--medium';
      case 'low': return 'ct-tag--low';
      default: return '';
    }
  };


  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRemoving) return;
    
    const confirmMessage = isReceived 
      ? t('sharedNotes.confirmRemoveReceived')
      : t('sharedNotes.confirmRemoveSent');
    
    toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      return (
        <div className={containerClass}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold">{confirmMessage}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => toast.remove(toastData.id)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={async () => {
                toast.remove(toastData.id);
                try {
                  setIsRemoving(true);
                  await onRemove(sharedNote.id);
                } catch (err) {
                  // toast lỗi đã được hiển thị trong hook removeSharedNote
                } finally {
                  setIsRemoving(false);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              {t('sharedNotes.remove')}
            </button>
          </div>
        </div>
      );
    }, { duration: 8000 });
  };

  const handleView = () => {
    onViewNote(sharedNote.note.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditNote) {
      onEditNote(sharedNote.note.id);
    }
  };

  const handleAddNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreateFromNote) {
      onCreateFromNote(sharedNote.note.id);
    }
  };

  const handleSavePermissions = async () => {
    try {
      setIsSaving(true);
      await notesService.updateSharedNotePermissions(sharedNote.id, localPermissions);
      toast.success(t('notes.share.permissionsUpdated'));
      setIsEditingPermissions(false);
      // Real-time update will be handled by socket event
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('notes.share.permissionsUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="ct-note group"
      onClick={(e) => {
        // Don't open modal when editing permissions
        if (isEditingPermissions) {
          e.stopPropagation();
          return;
        }
        handleView();
      }}
    >
      {/* Header */}
      <div className="ct-note-head">
        <div className="ct-note-who">
          <div className="ct-avatar ct-avatar--sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt={otherUser.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="ct-note-who-name">
              {otherUser.name}
            </p>
            <p className="ct-note-who-sub">
              {isReceived ? t('sharedNotes.sharedBy') : t('sharedNotes.sharedWith')}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="ct-note-actions">
          <button
            onClick={handleView}
            className="ct-icon-btn ct-icon-btn--info"
            title={t('sharedNotes.viewNote')}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit button - only for received notes with canEdit permission */}
          {isReceived && sharedNote.canEdit && onEditNote && (
            <button
              onClick={handleEdit}
              className="ct-icon-btn ct-icon-btn--ok"
              title={t('sharedNotes.editNote')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Add Note button - only for received notes with canCreate permission */}
          {isReceived && sharedNote.canCreate && onCreateFromNote && (
            <button
              onClick={handleAddNote}
              className="ct-icon-btn ct-icon-btn--ok"
              title={t('sharedNotes.addNote')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Edit permissions button - only for sent notes */}
          {isSent && !isEditingPermissions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingPermissions(true);
              }}
              className="ct-icon-btn ct-icon-btn--ok"
              title={t('sharedNotes.editPermissions') || 'Chỉnh sửa quyền'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          
          {/* Removing a received share never deletes the sender's original note, so view-only recipients may remove it too. */}
          {(isSent || isReceived) && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="ct-icon-btn ct-icon-btn--danger"
              title={t('sharedNotes.remove')}
              aria-label={t('sharedNotes.remove')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Note Info */}
      <div className="ct-note-panel">
        <div className="ct-note-title">
          <span className="ct-note-title-icon"><FileText className="w-4 h-4" /></span>
          <h4>
            {sharedNote.note.title}
          </h4>
        </div>

        {sharedNote.note.content && (
          <div
            className="ct-note-content"
            style={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              minWidth: 0
            }}
            title={getHtmlPreview(sharedNote.note.content, 500)}
            dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(sharedNote.note.content || '') }}
          />
        )}

        {/* Tags */}
        <div className="ct-tags">
          <span className={`ct-tag ${getPriorityColor(sharedNote.note.priority)}`}>
            {t(`filters.priority.${sharedNote.note.priority}`)}
          </span>
          {sharedNote.note.category && typeof sharedNote.note.category === 'object' && sharedNote.note.category.name ? (
            <span 
              className="ct-tag"
              style={{ 
                backgroundColor: `${sharedNote.note.category.color}20`,
                color: sharedNote.note.category.color
              }}
            >
              {(() => {
                const Icon = (LucideIcons as any)[sharedNote.note.category.icon] || LucideIcons.Tag;
                return <Icon className="w-3 h-3" style={{ color: sharedNote.note.category.color }} />;
              })()}
              {sharedNote.note.category.name}
            </span>
          ) : (
            <span className="ct-tag">
              {typeof sharedNote.note.category === 'string' ? (t(`filters.category.${sharedNote.note.category}`, 'General') || 'General') : 'General'}
            </span>
          )}
        </div>

        {/* Permissions Display / Edit */}
        <div>
          {isSent && isEditingPermissions ? (
            <div className="ct-perm-edit">
              <p>
                {t('notes.share.permissions') || 'Quyền hạn'}:
              </p>
              <label className="ct-perm-opt">
                <div onClick={() => setLocalPermissions(prev => ({ ...prev, canEdit: !prev.canEdit }))} className="cursor-pointer">
                  {localPermissions.canEdit ? <CheckSquare className="w-4 h-4 text-[var(--ct-accent)]" /> : <Square className="w-4 h-4 text-[var(--ct-faint)]" />}
                </div>
                <span>{t('notes.share.canEdit')}</span>
              </label>
              <label className="ct-perm-opt">
                <div onClick={() => setLocalPermissions(prev => ({ ...prev, canDelete: !prev.canDelete }))} className="cursor-pointer">
                  {localPermissions.canDelete ? <CheckSquare className="w-4 h-4 text-[var(--ct-accent)]" /> : <Square className="w-4 h-4 text-[var(--ct-faint)]" />}
                </div>
                <span>{t('notes.share.canDelete')}</span>
              </label>
              <label className="ct-perm-opt">
                <div onClick={() => setLocalPermissions(prev => ({ ...prev, canCreate: !prev.canCreate }))} className="cursor-pointer">
                  {localPermissions.canCreate ? <CheckSquare className="w-4 h-4 text-[var(--ct-accent)]" /> : <Square className="w-4 h-4 text-[var(--ct-faint)]" />}
                </div>
                <span>{t('notes.share.canCreate')}</span>
              </label>
              <div className="ct-perm-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSavePermissions();
                  }}
                  disabled={isSaving}
                  className="ct-btn ct-btn--sm ct-btn--solid"
                >
                  {isSaving ? t('actions.saving') || 'Đang lưu...' : t('actions.save') || 'Lưu'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingPermissions(false);
                    setLocalPermissions({
                      canEdit: sharedNote.canEdit,
                      canDelete: sharedNote.canDelete,
                      canCreate: sharedNote.canCreate,
                    });
                  }}
                  className="ct-btn ct-btn--sm ct-btn--ghost"
                >
                  {t('actions.cancel') || 'Hủy'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {isReceived && (
                <div className="ct-perms">
                  {sharedNote.canEdit && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Edit2 className="w-3 h-3 flex-shrink-0" />
                      {t('sharedNotes.canEdit')}
                    </span>
                  )}
                  {sharedNote.canDelete && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      {t('notes.share.canDelete')}
                    </span>
                  )}
                  {sharedNote.canCreate && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Plus className="w-3 h-3 flex-shrink-0" />
                      {t('notes.share.canCreate')}
                    </span>
                  )}
                  {!sharedNote.canEdit && !sharedNote.canDelete && !sharedNote.canCreate && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Eye className="w-3 h-3 flex-shrink-0" />
                      {t('sharedNotes.viewOnly')}
                    </span>
                  )}
                </div>
              )}
              {isSent && (
                <div className="ct-perms">
                  {sharedNote.canEdit && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Edit2 className="w-3 h-3 flex-shrink-0" />
                      {t('notes.share.canEdit')}
                    </span>
                  )}
                  {sharedNote.canDelete && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      {t('notes.share.canDelete')}
                    </span>
                  )}
                  {sharedNote.canCreate && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Plus className="w-3 h-3 flex-shrink-0" />
                      {t('notes.share.canCreate')}
                    </span>
                  )}
                  {!sharedNote.canEdit && !sharedNote.canDelete && !sharedNote.canCreate && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Eye className="w-3 h-3 flex-shrink-0" />
                      {t('sharedNotes.viewOnly')}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Shared Time */}
        <div className="ct-perms">
          <Calendar className="w-3 h-3" />
          <span>
            {getTimeAgo(sharedNote.sharedAt, i18n.language)}
          </span>
        </div>

        {/* Message */}
        {sharedNote.message && (
          <div className="ct-note-msg">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="italic line-clamp-2">{sharedNote.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SharedNoteItem.displayName = 'SharedNoteItem';

