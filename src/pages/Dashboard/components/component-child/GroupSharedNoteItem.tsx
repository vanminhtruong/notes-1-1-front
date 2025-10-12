import { Users, FileText, Calendar, Eye, Edit2, Trash2, Plus, CheckSquare, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, memo } from 'react';
import type { GroupSharedNote } from '@/services/notesService';
import { notesService } from '@/services/notesService';
import toast from 'react-hot-toast';
import { getTimeAgo } from '../../utils/timeUtils';
import { getHtmlPreview, sanitizeInlineHtml } from '@/utils/htmlUtils';

interface GroupSharedNoteItemProps {
  groupSharedNote: GroupSharedNote;
  currentUserId?: number;
  onViewNote: (noteId: number) => void;
  onEditNote?: (noteId: number) => void;
  onCreateFromNote?: (noteId: number) => void;
  onDeleteNote?: (noteId: number) => Promise<void>;
  onRemove?: (id: number) => Promise<void>;
}

export const GroupSharedNoteItem = memo(({ groupSharedNote, currentUserId, onViewNote, onEditNote, onCreateFromNote, onDeleteNote, onRemove }: GroupSharedNoteItemProps) => {
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
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
              onClick={() => toast.dismiss(toastData.id)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={async () => {
                toast.dismiss(toastData.id);
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
    if (isRemoving || !onRemove) return;

    const confirmMessage = t('sharedNotes.confirmRemoveGroup') || 'Bạn có chắc muốn xóa ghi chú chia sẻ này khỏi nhóm?';

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
              onClick={() => toast.dismiss(toastData.id)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={async () => {
                toast.dismiss(toastData.id);
                try {
                  setIsRemoving(true);
                  await onRemove(groupSharedNote.id);
                  toast.success(t('sharedNotes.removeSuccess'));
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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Group Header */}
          <div className="flex items-center gap-2 mb-2">
            {groupSharedNote.group.avatar ? (
              <img 
                src={groupSharedNote.group.avatar} 
                alt={groupSharedNote.group.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{groupSharedNote.group.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {t('sharedNotes.sharedBy') || 'Shared by'} {groupSharedNote.sharedByUser.name}
              </p>
            </div>
          </div>

          {/* Note Title */}
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <h4 className="font-medium text-gray-900 dark:text-white truncate flex-1 min-w-0">
              {groupSharedNote.note.title}
            </h4>
          </div>

          {/* Note Content */}
          <div
            className="text-sm text-gray-600 dark:text-gray-300 mb-2 pl-6"
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
          <div className="flex gap-2 items-center mb-2 pl-6">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(groupSharedNote.note.priority)}`}>
              {t(`notes.priority.${groupSharedNote.note.priority}`) || groupSharedNote.note.priority}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{getTimeAgo(groupSharedNote.sharedAt, i18n.language)}</span>
            </div>
          </div>

          {/* Permissions Display / Edit */}
          <div className="pl-6 space-y-2">
            {isEditingPermissions ? (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('notes.share.permissions') || 'Quyền hạn cho thành viên'}:
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setLocalPermissions(prev => ({ ...prev, canEdit: !prev.canEdit }))}>
                    {localPermissions.canEdit ? 
                      <CheckSquare className="w-4 h-4 text-blue-600" /> : 
                      <Square className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('notes.share.canEdit') || 'Cho phép chỉnh sửa'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setLocalPermissions(prev => ({ ...prev, canDelete: !prev.canDelete }))}>
                    {localPermissions.canDelete ? 
                      <CheckSquare className="w-4 h-4 text-blue-600" /> : 
                      <Square className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('notes.share.canDelete') || 'Cho phép xóa'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setLocalPermissions(prev => ({ ...prev, canCreate: !prev.canCreate }))}>
                    {localPermissions.canCreate ? 
                      <CheckSquare className="w-4 h-4 text-blue-600" /> : 
                      <Square className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('notes.share.canCreate') || 'Cho phép tạo mới'}</span>
                </label>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSavePermissions}
                    disabled={isSaving}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
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
                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {t('actions.cancel') || 'Hủy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
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
        <div className="flex items-start gap-1 ml-2">
          <button
            onClick={() => onViewNote(groupSharedNote.noteId)}
            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
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
              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
              title={t('sharedNotes.editNote')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {isMember && groupSharedNote.canDelete && onDeleteNote && (
            <button
              onClick={handleDeleteNote}
              disabled={isRemoving}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
              title={t('notes.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {isMember && groupSharedNote.canCreate && onCreateFromNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateFromNote(groupSharedNote.noteId);
              }}
              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
              title={t('sharedNotes.createFromNote')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          
          {/* Owner buttons - permissions management and delete */}
          {isOwner && !isEditingPermissions && (
            <>
              <button
                onClick={() => setIsEditingPermissions(true)}
                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
                title={t('sharedNotes.editPermissions') || 'Chỉnh sửa quyền'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
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
