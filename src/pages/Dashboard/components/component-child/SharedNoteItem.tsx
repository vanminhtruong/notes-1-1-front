import { FileText, User, Calendar, Edit2, Eye, Trash2, AlertCircle, Plus, CheckSquare, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import type { SharedNoteItemProps } from '../interface/SharedNotes.interface';
import { useEffect, useState, memo } from 'react';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import { notesService } from '@/services/notesService';
import { getTimeAgo } from '../../utils/timeUtils';

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
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
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
      className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-gray-700/30 hover:shadow-lg transition-all duration-200 cursor-pointer group"
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
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={otherUser.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {otherUser.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isReceived ? t('sharedNotes.sharedBy') : t('sharedNotes.sharedWith')}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleView}
            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
            title={t('sharedNotes.viewNote')}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit button - only for received notes with canEdit permission */}
          {isReceived && sharedNote.canEdit && onEditNote && (
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
              title={t('sharedNotes.editNote')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Add Note button - only for received notes with canCreate permission */}
          {isReceived && sharedNote.canCreate && onCreateFromNote && (
            <button
              onClick={handleAddNote}
              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
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
              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
              title={t('sharedNotes.editPermissions') || 'Chỉnh sửa quyền'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          
          {/* Remove button - always show for sent notes, only show for received notes if they have any permission */}
          {(isSent || (isReceived && (sharedNote.canEdit || sharedNote.canDelete || sharedNote.canCreate))) && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
              title={t('sharedNotes.remove')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Note Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0">
            {sharedNote.note.title}
          </h4>
        </div>

        {sharedNote.note.content && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 pl-6">
            {sharedNote.note.content}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pl-6">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(sharedNote.note.priority)}`}>
            {t(`filters.priority.${sharedNote.note.priority}`)}
          </span>
          {sharedNote.note.category && typeof sharedNote.note.category === 'object' && sharedNote.note.category.name ? (
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
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
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {typeof sharedNote.note.category === 'string' ? (t(`filters.category.${sharedNote.note.category}`, 'General') || 'General') : 'General'}
            </span>
          )}
        </div>

        {/* Permissions Display / Edit */}
        <div className="pl-6 space-y-2">
          {isSent && isEditingPermissions ? (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('notes.share.permissions') || 'Quyền hạn'}:
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setLocalPermissions(prev => ({ ...prev, canEdit: !prev.canEdit }))} className="cursor-pointer">
                  {localPermissions.canEdit ? <CheckSquare className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{t('notes.share.canEdit')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setLocalPermissions(prev => ({ ...prev, canDelete: !prev.canDelete }))} className="cursor-pointer">
                  {localPermissions.canDelete ? <CheckSquare className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{t('notes.share.canDelete')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setLocalPermissions(prev => ({ ...prev, canCreate: !prev.canCreate }))} className="cursor-pointer">
                  {localPermissions.canCreate ? <CheckSquare className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{t('notes.share.canCreate')}</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSavePermissions();
                  }}
                  disabled={isSaving}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
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
                  className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {t('actions.cancel') || 'Hủy'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {isReceived && (
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
        <div className="flex items-center gap-1 pl-6 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>
            {getTimeAgo(sharedNote.sharedAt, i18n.language)}
          </span>
        </div>

        {/* Message */}
        {sharedNote.message && (
          <div className="pl-6 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-1 text-xs text-gray-600 dark:text-gray-300">
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

