import ModalScrollArea from '@/components/ModalScrollArea';
import { useState, useEffect } from 'react';
import { X, Tag, Plus, Edit2, Trash2, Search, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNoteTagsHandler } from '../hooks/Manager-handle/useNoteTagsHandler';
import { useNoteTagsEffects } from '../hooks/Manager-Effects/useNoteTagsEffects';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useConfirmationToast } from '../hooks/Manager-handle/useConfirmationToastHandler';
import type { NoteTag, CreateTagData } from '@/services/notesService';

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#6366F1', // indigo
  '#F97316', // orange
  '#84CC16', // lime
];

const TagManagementModal = ({ isOpen, onClose }: TagManagementModalProps) => {
  const { t } = useTranslation('dashboard');
  const { tags, isLoading, loadTags, createTag, updateTag, deleteTag, togglePinTag } = useNoteTagsHandler();
  useNoteTagsEffects();
  const { confirmWithToast } = useConfirmationToast({ 
    t: (key: string, defaultValue?: string) => t(key, defaultValue || '') as string 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<NoteTag | null>(null);
  const [formData, setFormData] = useState<CreateTagData>({ name: '', color: TAG_COLORS[0] });

  // Disable body scroll when modal is open
  useBodyScrollLock(isOpen);

  // Load tags when modal opens (only if empty)
  useEffect(() => {
    if (isOpen && tags.length === 0) {
      loadTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
        setEditingTag(null);
      } else {
        await createTag(formData);
      }
      setFormData({ name: '', color: TAG_COLORS[0] });
      setIsCreating(false);
    } catch (error) {
      console.error('Tag operation error:', error);
    }
  };

  const handleEdit = (tag: NoteTag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color });
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmWithToast(t('tags.confirmDelete'));
    if (confirmed) {
      await deleteTag(id);
    }
  };

  const handleTogglePin = async (id: number) => {
    await togglePinTag(id);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTag(null);
    setFormData({ name: '', color: TAG_COLORS[0] });
  };

  if (!isOpen) return null;

  return (
    <div className="pm-overlay z-50">
      <div className="pm-panel pm-panel--2xl" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="pm-header">
          <h2 className="pm-title">
            <Tag className="w-5 h-5 md-down:w-4.5 md-down:h-4.5 sm-down:w-4 sm-down:h-4" />
            {t('tags.manage')}
          </h2>
          <button
            onClick={onClose}
            className="pm-close"
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <ModalScrollArea className="pm-body">
          {/* Create/Edit Form */}
          {isCreating && (
            <form onSubmit={handleSubmit} className="pm-card mb-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tags.name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('tags.namePlaceholder')}
                    className="w-full px-4 py-2 md-down:px-3 md-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md-down:text-xs"
                    maxLength={50}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tags.color')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {TAG_COLORS.map((colorValue) => (
                      <button
                        key={colorValue}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: colorValue })}
                        className={`w-8 h-8 md-down:w-7 md-down:h-7 rounded-full transition-all ${
                          formData.color === colorValue
                            ? 'ring-4 ring-blue-300 dark:ring-blue-600 ring-offset-2 dark:ring-offset-gray-700 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorValue }}
                        title={colorValue}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="pm-btn pm-btn--ghost pm-btn--sm"
                  >
                    {t('tags.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="pm-btn pm-btn--primary pm-btn--sm"
                    disabled={!formData.name.trim()}
                  >
                    {editingTag ? t('tags.save') : t('tags.save')}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Create Button */}
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="pm-dashed-btn w-full mb-4"
            >
              <Plus className="w-4 h-4" />
              {t('tags.create')}
            </button>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tags.searchTags')}
              className="w-full pl-10 pr-4 py-2 md-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md-down:text-xs"
            />
          </div>

          {/* Tags List */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('sharedNotes.loading')}</div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery ? t('tags.noTagsFound') : t('tags.noTags')}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="pm-card pm-card--row flex items-center justify-between p-3 md-down:p-2.5"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {tag.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 md-down:w-3 md-down:h-3" fill="currentColor" />
                    )}
                    <div
                      className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-gray-900 dark:text-white font-medium text-sm md-down:text-xs truncate">
                      {tag.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      ({tag.notesCount || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleTogglePin(tag.id)}
                      className={`p-2 md-down:p-1.5 rounded-lg transition-colors ${
                        tag.isPinned
                          ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={tag.isPinned ? t('tags.unpin') : t('tags.pin')}
                    >
                      <Pin className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" fill={tag.isPinned ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-2 md-down:p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title={t('tags.edit')}
                    >
                      <Edit2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-2 md-down:p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title={t('tags.delete')}
                    >
                      <Trash2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalScrollArea>

        {/* Footer */}
        <div className="pm-footer pm-footer--end">
          <button
            onClick={onClose}
            className="pm-btn pm-btn--ghost"
          >
            <X className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManagementModal;
