import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Tag as TagIcon, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNoteTags } from '../hooks/useNoteTags';
import type { NoteTag } from '@/services/notesService';

interface TagSelectorProps {
  noteId: number;
  selectedTags: NoteTag[];
  onOpenManagement?: () => void;
  onOpenChange?: (open: boolean) => void;
}

const TagSelector = ({ noteId, selectedTags, onOpenManagement, onOpenChange }: TagSelectorProps) => {
  const { t } = useTranslation('dashboard');
  const { tags, loadTags, addTagToNote, removeTagFromNote } = useNoteTags();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [portalPos, setPortalPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 256 });

  // Load tags only if not already loaded (fallback)
  useEffect(() => {
    if (tags.length === 0) {
      loadTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      const clickedTrigger = triggerRef.current && triggerRef.current.contains(target as Node);
      if (!clickedInsideDropdown && !clickedTrigger) {
        setIsOpen(false);
        onOpenChange && onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const updatePortalPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(256, Math.max(208, rect.width + 128));
    let left = rect.left;
    const top = rect.bottom + 8; // 8px below trigger
    const vw = window.innerWidth;
    if (left + width > vw - 8) left = Math.max(8, vw - width - 8);
    setPortalPos({ top, left, width });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePortalPosition();
    const onScroll = () => updatePortalPosition();
    const onResize = () => updatePortalPosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  const selectedTagIds = selectedTags.map((t) => t.id);
  const availableTags = tags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTag = async (tagId: number) => {
    try {
      await addTagToNote(noteId, tagId);
      setSearchQuery('');
    } catch (error) {
      console.error('Add tag error:', error);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      await removeTagFromNote(noteId, tagId);
    } catch (error) {
      console.error('Remove tag error:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Tags Display */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedTags.map((tag) => (
          <div
            key={tag.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 md-down:px-2 md-down:py-0.5 rounded-full text-xs md-down:text-[10px] font-medium text-white transition-all hover:shadow-md"
            style={{ backgroundColor: tag.color }}
          >
            <span>{tag.name}</span>
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              title="Xóa tag"
            >
              <X className="w-3 h-3 md-down:w-2.5 md-down:h-2.5" />
            </button>
          </div>
        ))}

        {/* Add Tag Button */}
        <button
          ref={triggerRef}
          onClick={() => {
            const next = !isOpen;
            setIsOpen(next);
            onOpenChange && onOpenChange(next);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 md-down:px-2 md-down:py-0.5 rounded-full text-xs md-down:text-[10px] font-medium border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Plus className="w-3 h-3 md-down:w-2.5 md-down:h-2.5" />
          {t('tags.addTag')}
        </button>
      </div>

      {/* Dropdown via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999]"
          style={{ top: portalPos.top, left: portalPos.left, width: portalPos.width }}
        >
          {/* Header */}
          <div className="p-3 md-down:p-2.5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-sm md-down:text-xs font-medium text-gray-900 dark:text-white">
                <TagIcon className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                {t('tags.selectTags')}
              </div>
              {onOpenManagement && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenChange && onOpenChange(false);
                    onOpenManagement();
                  }}
                  className="p-1.5 md-down:p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title={t('tags.manage')}
                >
                  <Settings className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tags.searchToAdd')}
              className="w-full px-3 py-1.5 md-down:px-2 md-down:py-1 text-sm md-down:text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Tags List */}
          <div className="max-h-60 md-down:max-h-48 overflow-y-auto p-2 md-down:p-1.5">
            {availableTags.length === 0 ? (
              <div className="text-center py-4 text-sm md-down:text-xs text-gray-500 dark:text-gray-400">
                {searchQuery ? t('tags.noTagsFound') : t('tags.noTags')}
              </div>
            ) : (
              <div className="space-y-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 md-down:px-2 md-down:py-1.5 text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div
                      className="w-3 h-3 md-down:w-2.5 md-down:h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm md-down:text-xs text-gray-900 dark:text-white flex-1 truncate">
                      {tag.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TagSelector;
