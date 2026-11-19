import { Users, FileText, Calendar, Eye, Edit2, Trash2, FileX2, Plus, CheckSquare, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, memo } from 'react';
import type { GroupSharedNote } from '@/services/notesService';
import { notesService } from '@/services/notesService';
import toast from 'react-hot-toast';
import { getTimeAgo } from '../../utils/timeUtils';
import { getHtmlPreview, sanitizeInlineHtml } from '@/utils/htmlUtils';
import './ChatWindow-child/chat-tabs.css';

interface GroupSharedNoteItemProps {
  groupSharedNote: GroupSharedNote;
  currentUserId?: number;
  onViewNote: (noteId: number) => void;
  onEditNote?: (noteId: number) => void;
  onCreateFromNote?: (noteId: number) => void;
  onDeleteNote?: (noteId: number) => Promise<void>;
  onRemove?: (id: number) => Promise<void>;
  onDismiss?: (id: number) => Promise<void>;
}

export const GroupSharedNoteItem = memo(({ groupSharedNote, currentUserId, onViewNote, onEditNote, onCreateFromNote, onDeleteNote, onRemove, onDismiss }: GroupSharedNoteItemProps) => {
  const { t, i18n } = useTranslation('dashboard');
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [localPermissions, setLocalPermissions] = useState({
    canEdit: groupSharedNote.canEdit,
    canDelete: groupSharedNote.canDelete,
    canCreate: groupSharedNote.canCreate,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const isOwner = currentUserId === groupSharedNote.sharedByUserId;
  const isMember = !isOwner; // Member if not owner

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'ct-tag--high';
      case 'medium': return 'ct-tag--medium';
      case 'low': return 'ct-tag--low';
      default: return '';
    }
  };

  const handleSavePermissions = async () => {
    try {
      setIsSaving(true);
      await notesService.updateGroupSharedNotePermissions(groupSharedNote.id, localPermissions);
      toast.success(t('sharedNotes.permissionsUpdated') || 'Cập nhật quyền thành công');
      setIsEditingPermissions(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('sharedNotes.permissionsUpdateFailed') || 'Cập nhật quyền thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRemoving || !onDeleteNote) return;

    toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      return (
        <div className={containerClass}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold">{t('notes.confirmDelete')}</p>
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
                  await onDeleteNote(groupSharedNote.noteId);
                  toast.success(t('notes.deleteSuccess'));
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || t('notes.deleteError'));
                } finally {
                  setIsRemoving(false);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              {t('actions.delete')}
            </button>
          </div>
        </div>
      );
    }, { duration: 8000 });
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRemoving || !(isOwner ? onRemove : onDismiss)) return;

    const confirmMessage = isOwner ? t('sharedNotes.confirmRemoveGroup') : t('sharedNotes.confirmDismissGroup');

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
                  if (isOwner) await onRemove?.(groupSharedNote.id);
                  else await onDismiss?.(groupSharedNote.id);
                  toast.success(t(isOwner ? 'sharedNotes.removeSuccess' : 'sharedNotes.dismissGroupSuccess'));
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || t('sharedNotes.errors.removeFailed'));
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

  return (
    <div className="ct-note ct-note--plain group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Group Header */}
          <div className="ct-note-who mb-3">
            {groupSharedNote.group.avatar ? (
              <img 
                src={groupSharedNote.group.avatar} 
                alt={groupSharedNote.group.name}
                className="w-9 h-9 rounded-[13px] object-cover flex-shrink-0"
              />
            ) : (
              <div className="ct-avatar ct-avatar--sm ct-avatar--sq">
                <Users className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="ct-note-who-name">{groupSharedNote.group.name}</p>
              <p className="ct-note-who-sub">
                {t('sharedNotes.sharedBy') || 'Shared by'} {groupSharedNote.sharedByUser.name}
              </p>
            </div>
          </div>

          {/* Note Title */}
          <div className="ct-note-title">
            <span className="ct-note-title-icon"><FileText className="w-4 h-4" /></span>
            <h4>
              {groupSharedNote.note.title}
            </h4>
          </div>

          {/* Note Content */}
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
            title={getHtmlPreview(groupSharedNote.note.content, 500)}
            dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(groupSharedNote.note.content || '') }}
          />

          {/* Tags */}
          <div className="ct-tags">
            <span className={`ct-tag ${getPriorityColor(groupSharedNote.note.priority)}`}>
              {t(`notes.priority.${groupSharedNote.note.priority}`) || groupSharedNote.note.priority}
            </span>
            <div className="ct-tag ct-tag--time">
              <Calendar className="w-3 h-3" />
              <span>{getTimeAgo(groupSharedNote.sharedAt, i18n.language)}</span>
            </div>
          </div>

          {/* Permissions Display / Edit */}
          <div>
            {isEditingPermissions ? (
              <div className="ct-perm-edit">
                <p>
                  {t('notes.share.permissions') || 'Quyền hạn cho thành viên'}:
                </p>
                <label className="ct-perm-opt">
                  <div onClick={() => setLocalPermissions(prev => ({ ...prev, canEdit: !prev.canEdit }))}>
                    {localPermissions.canEdit ? 
                      <CheckSquare className="w-4 h-4 text-[var(--ct-accent)]" /> : 
                      <Square className="w-4 h-4 text-[var(--ct-faint)]" />
                    }
                  </div>
                  <span>{t('notes.share.canEdit') || 'Cho phép chỉnh sửa'}</span>
                </label>
                <label className="ct-perm-opt">
                  <div onClick={() => setLocalPermissions(prev => ({ ...prev, canDelete: !prev.canDelete }))}>
                    {localPermissions.canDelete ? 
                      <CheckSquare className="w-4 h-4 text-[var(--ct-accent)]" /> : 
                      <Square className="w-4 h-4 text-[var(--ct-faint)]" />
                    }
                  </div>
                  <span>{t('notes.share.canDelete') || 'Cho phép xóa'}</span>
                </label>
                <label className="ct-perm-opt">
                  <div onClick={() => setLocalPermissions(prev => ({ ...prev, canCreate: !prev.canCreate }))}>
                    {localPermissions.canCreate ? 
                      <CheckSquare className="w-4 h-4 text-[var(--ct-accent)]" /> : 
                      <Square className="w-4 h-4 text-[var(--ct-faint)]" />
                    }
                  </div>
                  <span>{t('notes.share.canCreate') || 'Cho phép tạo mới'}</span>
                </label>
                <div className="ct-perm-actions">
                  <button
                    onClick={handleSavePermissions}
                    disabled={isSaving}
                    className="ct-btn ct-btn--sm ct-btn--solid"
                  >
                    {isSaving ? (t('actions.saving') || 'Đang lưu...') : (t('actions.save') || 'Lưu')}
                  </button>
                  <button
                    onClick={() => {
                      setLocalPermissions({
                        canEdit: groupSharedNote.canEdit,
                        canDelete: groupSharedNote.canDelete,
                        canCreate: groupSharedNote.canCreate,
                      });
                      setIsEditingPermissions(false);
                    }}
                    className="ct-btn ct-btn--sm ct-btn--ghost"
                  >
                    {t('actions.cancel') || 'Hủy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="ct-perms">
                {groupSharedNote.canEdit && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Edit2 className="w-3 h-3 flex-shrink-0" />
                    {isOwner ? t('notes.share.canEdit') : t('sharedNotes.canEdit')}
                  </span>
                )}
                {groupSharedNote.canDelete && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Trash2 className="w-3 h-3 flex-shrink-0" />
                    {t('notes.share.canDelete')}
                  </span>
                )}
                {groupSharedNote.canCreate && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Plus className="w-3 h-3 flex-shrink-0" />
                    {t('notes.share.canCreate')}
                  </span>
                )}
                {!groupSharedNote.canEdit && !groupSharedNote.canDelete && !groupSharedNote.canCreate && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Eye className="w-3 h-3 flex-shrink-0" />
                    {t('sharedNotes.viewOnly')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ct-note-actions ml-2">
          <button
            onClick={() => onViewNote(groupSharedNote.noteId)}
            className="ct-icon-btn ct-icon-btn--info"
            title={t('sharedNotes.viewNote')}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Member buttons - when they have permissions */}
          {isMember && groupSharedNote.canEdit && onEditNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditNote(groupSharedNote.noteId);
              }}
              className="ct-icon-btn ct-icon-btn--ok"
              title={t('sharedNotes.editNote')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {isMember && groupSharedNote.canDelete && onDeleteNote && (
            <button
              onClick={handleDeleteNote}
              disabled={isRemoving}
              className="ct-icon-btn ct-icon-btn--danger"
              title={t('sharedNotes.deleteOriginal')}
              aria-label={t('sharedNotes.deleteOriginal')}
            >
              <FileX2 className="w-4 h-4" />
            </button>
          )}

          {isMember && groupSharedNote.canCreate && onCreateFromNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateFromNote(groupSharedNote.noteId);
              }}
              className="ct-icon-btn ct-icon-btn--ok"
              title={t('sharedNotes.createFromNote')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          
          {/* Members may hide a group note from their own list, independent of edit/delete rights. */}
          {isMember && !!onDismiss && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="ct-icon-btn ct-icon-btn--danger"
              title={t('sharedNotes.dismissGroup')}
              aria-label={t('sharedNotes.dismissGroup')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Owner buttons - permissions management and remove the group-wide share */}
          {isOwner && !isEditingPermissions && (
            <>
              <button
                onClick={() => setIsEditingPermissions(true)}
                className="ct-icon-btn ct-icon-btn--ok"
                title={t('sharedNotes.editPermissions') || 'Chỉnh sửa quyền'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="ct-icon-btn ct-icon-btn--danger"
                title={t('sharedNotes.remove')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

GroupSharedNoteItem.displayName = 'GroupSharedNoteItem';
