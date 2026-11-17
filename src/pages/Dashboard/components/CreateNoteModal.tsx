import ModalScrollArea from '@/components/ModalScrollArea';
import { useTranslation } from 'react-i18next';
import { useState, memo, useEffect, useCallback, useRef } from 'react';
import { X, ChevronDown, Search, Loader2, FilePlus2, Image as ImageIcon, Video, Youtube } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { RichTextEditor, useRichTextEditor } from '@/components/RichTextEditor';
import { notesService, type NoteCategory } from '@/services/notesService';
import PriorityDropdown from './PriorityDropdown';
import './NoteCategoryDropdown.scss';

// MediaTabs Component
const MediaTabs = memo(({ newNote, setNewNote, t }: { newNote: any; setNewNote: (note: any) => void; t: any }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'youtube'>('image');

  return (
    <div>
      {/* Tabs */}
      <div className="pm-segment mb-4" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'image'}
          onClick={() => setActiveTab('image')}
          className={`pm-segment__btn ${activeTab === 'image' ? 'is-active' : ''}`}
        >
          <ImageIcon />
          <span>{t('modals.create.fields.image')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'video'}
          onClick={() => setActiveTab('video')}
          className={`pm-segment__btn ${activeTab === 'video' ? 'is-active' : ''}`}
        >
          <Video />
          <span>{t('modals.create.fields.video')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'youtube'}
          onClick={() => setActiveTab('youtube')}
          className={`pm-segment__btn ${activeTab === 'youtube' ? 'is-active' : ''}`}
        >
          <Youtube />
          <span>{t('modals.create.fields.youtube')}</span>
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
                  setNewNote({ ...newNote, imageUrl: url, videoUrl: '', youtubeUrl: '' });
                } catch (_err) {
                  // ignore
                }
              }}
              className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {newNote.imageUrl && (
              <img src={newNote.imageUrl} alt="preview" className="w-16 h-16 rounded-md object-cover border" />
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
                  setNewNote({ ...newNote, videoUrl: url, imageUrl: '', youtubeUrl: '' });
                } catch (_err) {
                  // ignore
                }
              }}
              className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {newNote.videoUrl && (
              <video src={newNote.videoUrl} className="w-16 h-16 rounded-md object-cover border" />
            )}
          </div>
        )}

        {activeTab === 'youtube' && (
          <input
            type="url"
            value={newNote.youtubeUrl}
            onChange={(e) => setNewNote({ ...newNote, youtubeUrl: e.target.value, imageUrl: '', videoUrl: '' })}
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
            <ModalScrollArea className="note-category-list max-h-60">
              {/* None option */}
              <button
                type="button"
                data-selected={value === undefined}
                aria-pressed={value === undefined}
                onClick={() => {
                  onChange(undefined);
                  handleClose();
                }}
                className="note-category-option note-category-option--none text-sm text-gray-700 dark:text-gray-300"
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
                      className="note-category-option text-sm"
                      data-selected={value === cat.id}
                      aria-pressed={value === cat.id}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }} />
                      <span className="min-w-0 flex-1 truncate" style={{ color: cat.color }} title={cat.name}>{cat.name}</span>
                    </button>
                  );
                })
              ) : searchTerm && !isSearching ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('category.noResults')}
                </div>
              ) : null}
            </ModalScrollArea>
          </div>
        </>
      )}
    </div>
  );
});

CategoryDropdown.displayName = 'CategoryDropdown';

export interface NewNote {
  title: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  youtubeUrl: string;
  categoryId: number | undefined;
  priority: 'low' | 'medium' | 'high';
  reminderAtLocal: string;
  sharedFromUserId: number | undefined;
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  newNote: NewNote;
  setNewNote: (note: NewNote) => void;
  onSubmit: () => void;
  categories: Array<{ id: number; name: string; color: string; icon: string }>;
}

const CreateNoteModal = memo(({ isOpen, onClose, newNote, setNewNote, onSubmit, categories }: CreateNoteModalProps) => {
  const { t } = useTranslation('dashboard');
  
  const editor = useRichTextEditor({
    content: newNote.content,
    placeholder: t('modals.create.fields.contentPlaceholder'),
    onUpdate: (html) => {
      setNewNote({ ...newNote, content: html });
    },
  });

  // Reset editor when modal opens/closes
  useEffect(() => {
    if (editor && isOpen) {
      editor.commands.setContent(newNote.content || '');
      // Ensure formatting state doesn't persist between openings
      requestAnimationFrame(() => {
        try {
          editor.chain().focus('end').unsetAllMarks().setTextAlign('left').run();
        } catch {}
      });
    }
  }, [isOpen, editor]);

  if (!isOpen) return null;

  return (
    <div className="pm-overlay z-50">
      <div className="pm-panel pm-panel--xl" role="dialog" aria-modal="true">
        <div className="pm-header">
          <h2 className="pm-title">
            <FilePlus2 />{t('modals.create.title')}</h2>
          <button
            onClick={onClose}
            className="pm-close"
            title="Đóng"
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
          </button>
        </div>
        
        <ModalScrollArea className="pm-body pm-stack">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              {t('modals.create.fields.title')}
            </label>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
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
            <div className="pm-card">
              <MediaTabs newNote={newNote} setNewNote={setNewNote} t={t} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
                {t('modals.create.fields.category')}
              </label>
              <CategoryDropdown
                value={newNote.categoryId}
                onChange={(categoryId) => setNewNote({ ...newNote, categoryId })}
                categories={categories}
                placeholder={t('category.none')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
                {t('modals.create.fields.priority')}
              </label>
              <PriorityDropdown
                value={newNote.priority}
                onChange={(priority) => setNewNote({ ...newNote, priority })}
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
              value={newNote.reminderAtLocal}
              onChange={(e) => setNewNote({ ...newNote, reminderAtLocal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:px-2 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 xs-down:text-[10px] xs-down:mt-0.5">{t('modals.create.fields.reminderHint')}</p>
          </div>
        </ModalScrollArea>

        <div className="pm-footer">
          <button
            onClick={onClose}
            className="pm-btn pm-btn--ghost"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={onSubmit}
            disabled={!newNote.title.trim()}
            className="pm-btn pm-btn--primary"
          >
            {t('actions.createNote')}
          </button>
        </div>
      </div>
    </div>
  );
});

CreateNoteModal.displayName = 'CreateNoteModal';

export default CreateNoteModal;
