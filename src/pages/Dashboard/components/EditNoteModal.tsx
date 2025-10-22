import { useTranslation } from 'react-i18next';
import { useState, memo, useEffect, useCallback, useRef } from 'react';
import { X, ChevronDown, Search, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { RichTextEditor, useRichTextEditor } from '@/components/RichTextEditor';
import { notesService, type NoteCategory } from '@/services/notesService';
import PriorityDropdown from './PriorityDropdown';

// MediaTabs Component
const MediaTabs = memo(({ editNote, setEditNote, t }: { editNote: any; setEditNote: (note: any) => void; t: any }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'youtube'>('image');

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-600 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'image'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📷 {t('modals.create.fields.image')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'video'
              ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          🎬 {t('modals.create.fields.video')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('youtube')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'youtube'
              ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📺 {t('modals.create.fields.youtube')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[50px]">
        {activeTab === 'image' && (
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
                  setEditNote({ ...editNote, imageUrl: url, videoUrl: '', youtubeUrl: '' });
                } catch (_err) {
                  // ignore
                }
              }}
              className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {editNote.imageUrl && (
              <img src={editNote.imageUrl} alt="preview" className="w-16 h-16 rounded-md object-cover border" />
            )}
          </div>
        )}

        {activeTab === 'video' && (
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="video/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const { uploadService } = await import('@/services/uploadService');
                  const { url } = await uploadService.uploadFile(file);
                  setEditNote({ ...editNote, videoUrl: url, imageUrl: '', youtubeUrl: '' });
                } catch (err) {
                  console.error('Video upload failed:', err);
                }
              }}
              className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {editNote.videoUrl && (
              <video 
                src={editNote.videoUrl} 
                preload="metadata"
                muted
                className="w-16 h-16 rounded-md object-cover border" 
              />
            )}
          </div>
        )}

        {activeTab === 'youtube' && (
          <input
            type="url"
            value={editNote.youtubeUrl}
            onChange={(e) => setEditNote({ ...editNote, youtubeUrl: e.target.value, imageUrl: '', videoUrl: '' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            placeholder={t('modals.create.fields.youtubePlaceholder')}
          />
        )}
      </div>
    </div>
  );
});

MediaTabs.displayName = 'MediaTabs';

// CategoryDropdown Component
interface CategoryDropdownProps {
  value: number | undefined;
  onChange: (categoryId: number | undefined) => void;
  categories: Array<{ id: number; name: string; color: string; icon: string; selectionCount?: number }>;
  placeholder: string;
}

const CategoryDropdown = memo(({ value, onChange, categories: initialCategories, placeholder }: CategoryDropdownProps) => {
  const { t } = useTranslation('dashboard');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<NoteCategory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lấy category đã chọn
  const selectedCategory = initialCategories.find(cat => cat.id === value) || 
                          searchResults.find(cat => cat.id === value);

  // Hiển thị categories: nếu có search thì hiển thị kết quả search, không thì hiển thị categories ban đầu
  const displayCategories = searchTerm ? searchResults : initialCategories;

  // Hàm tìm kiếm categories từ backend
  const searchCategories = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await notesService.searchCategories(query, 20);
      setSearchResults(response.categories);
    } catch (error) {
      console.error('Search categories error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchCategories(searchTerm);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, searchCategories]);

  // Focus vào search input khi mở dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset search khi đóng dropdown
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:px-2 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs flex items-center justify-between gap-2"
      >
        {selectedCategory ? (
          <span className="flex items-center gap-2 flex-1 min-w-0">
            {(() => {
              const Icon = (LucideIcons as any)[selectedCategory.icon] || LucideIcons.Tag;
              return <Icon className="w-4 h-4 flex-shrink-0" style={{ color: selectedCategory.color }} />;
            })()}
            <span className="truncate" style={{ color: selectedCategory.color }}>{selectedCategory.name}</span>
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
        )}
        <ChevronDown className="w-4 h-4 flex-shrink-0" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={handleClose}
          />
          <div className="absolute z-20 w-full bottom-full mb-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('category.searchPlaceholder')}
                  className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>
            </div>

            {/* Categories List */}
            <div className="max-h-60 overflow-y-auto">
              {/* None option */}
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  handleClose();
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300 transition-colors"
              >
                {placeholder}
              </button>

              {/* Categories */}
              {displayCategories.length > 0 ? (
                displayCategories.map((cat) => {
                  const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.Tag;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onChange(cat.id);
                        handleClose();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm flex items-center gap-2 transition-colors"
                      style={{ 
                        backgroundColor: value === cat.id ? `${cat.color}15` : undefined 
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }} />
                      <span style={{ color: cat.color }}>{cat.name}</span>
                    </button>
                  );
                })
              ) : searchTerm && !isSearching ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('category.noResults')}
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

CategoryDropdown.displayName = 'CategoryDropdown';

export interface EditNote {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  youtubeUrl: string;
  categoryId: number | undefined;
  priority: 'low' | 'medium' | 'high';
  reminderAtLocal: string;
}

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editNote: EditNote;
  setEditNote: (note: EditNote) => void;
  onSubmit: () => void;
  categories: Array<{ id: number; name: string; color: string; icon: string }>;
}

const EditNoteModal = memo(({ isOpen, onClose, editNote, setEditNote, onSubmit, categories }: EditNoteModalProps) => {
  const { t } = useTranslation('dashboard');
  
  const editor = useRichTextEditor({
    content: editNote.content,
    placeholder: t('modals.create.fields.contentPlaceholder'),
    onUpdate: (html) => {
      setEditNote({ ...editNote, content: html });
    },
  });

  // Update editor when editNote changes
  useEffect(() => {
    if (editor && isOpen) {
      editor.commands.setContent(editNote.content || '');
      // Ensure formatting state doesn't persist between openings
      requestAnimationFrame(() => {
        try {
          editor.chain().focus('end').unsetAllMarks().clearNodes().setParagraph().setTextAlign('left').run();
          const view: any = editor.view;
          const { state, dispatch } = view || {};
          if (state && dispatch) {
            dispatch(state.tr.setStoredMarks([]));
          }
        } catch {}
      });
    }
  }, [isOpen, editor, editNote.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 xl-down:p-3.5 lg-down:p-3 md-down:p-2.5 sm-down:p-2 xs-down:p-1.5 z-[99999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl xl-down:rounded-xl lg-down:rounded-xl md-down:rounded-lg sm-down:rounded-lg xs-down:rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-3 xl-down:px-5 xl-down:pt-5 xl-down:pb-2.5 lg-down:px-5 lg-down:pt-5 lg-down:pb-2.5 md-down:px-4 md-down:pt-4 md-down:pb-2 sm-down:px-3.5 sm-down:pt-3.5 sm-down:pb-2 xs-down:px-3 xs-down:pt-3 xs-down:pb-1.5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white xl-down:text-lg lg-down:text-lg md-down:text-base sm-down:text-base xs-down:text-sm">{t('modals.edit.title')}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md-down:p-0.5 xs-down:p-0.5"
            title="Đóng"
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
          </button>
        </div>

        <div className="space-y-3 px-6 pb-6 overflow-y-auto xl-down:space-y-2.5 xl-down:px-5 xl-down:pb-5 lg-down:space-y-2.5 lg-down:px-5 lg-down:pb-5 md-down:space-y-2 md-down:px-4 md-down:pb-4 sm-down:space-y-2 sm-down:px-3.5 sm-down:pb-3.5 xs-down:space-y-1.5 xs-down:px-3 xs-down:pb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              {t('modals.create.fields.title')}
            </label>
            <input
              type="text"
              value={editNote.title}
              onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:px-2 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs"
              placeholder={t('modals.create.fields.titlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              {t('modals.create.fields.content')}
            </label>
            <RichTextEditor
              editor={editor}
              placeholder={t('modals.create.fields.contentPlaceholder')}
            />
          </div>

          {/* Media Section - Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              {t('modals.create.fields.media')}
            </label>
            <MediaTabs editNote={editNote} setEditNote={setEditNote} t={t} />
          </div>

          <div className="grid grid-cols-2 gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
                {t('modals.create.fields.category')}
              </label>
              <CategoryDropdown
                value={editNote.categoryId}
                onChange={(categoryId) => setEditNote({ ...editNote, categoryId })}
                categories={categories}
                placeholder={t('category.none')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
                {t('modals.create.fields.priority')}
              </label>
              <PriorityDropdown
                value={editNote.priority}
                onChange={(priority) => setEditNote({ ...editNote, priority })}
              />
            </div>
          </div>

          {/* Reminder datetime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              {t('modals.create.fields.reminderAt')}
            </label>
            <input
              type="datetime-local"
              value={editNote.reminderAtLocal}
              onChange={(e) => setEditNote({ ...editNote, reminderAtLocal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:px-2 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 xs-down:text-[10px] xs-down:mt-0.5">{t('modals.create.fields.reminderHint')}</p>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700 xl-down:gap-2.5 xl-down:px-5 xl-down:pb-5 xl-down:pt-3.5 lg-down:gap-2.5 lg-down:px-5 lg-down:pb-5 lg-down:pt-3.5 md-down:gap-2 md-down:px-4 md-down:pb-4 md-down:pt-3 sm-down:gap-2 sm-down:px-3.5 sm-down:pb-3.5 sm-down:pt-2.5 xs-down:gap-1.5 xs-down:px-3 xs-down:pb-3 xs-down:pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 md-down:px-3 md-down:py-1.5 md-down:text-sm sm-down:px-2.5 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={onSubmit}
            disabled={!editNote.title.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 md-down:px-3 md-down:py-1.5 md-down:text-sm sm-down:px-2.5 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs"
          >
            {t('actions.update')}
          </button>
        </div>
      </div>
    </div>
  );
});

EditNoteModal.displayName = 'EditNoteModal';

export default EditNoteModal;

