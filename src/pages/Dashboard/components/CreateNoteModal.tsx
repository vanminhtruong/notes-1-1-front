import { useTranslation } from 'react-i18next';
import { useState, memo } from 'react';
import { X } from 'lucide-react';

// MediaTabs Component
const MediaTabs = memo(({ newNote, setNewNote, t }: { newNote: any; setNewNote: (note: any) => void; t: any }) => {
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

export interface NewNote {
  title: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  youtubeUrl: string;
  category: string;
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
}

const CreateNoteModal = memo(({ isOpen, onClose, newNote, setNewNote, onSubmit }: CreateNoteModalProps) => {
  const { t } = useTranslation('dashboard');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 xl-down:p-3.5 lg-down:p-3 md-down:p-2.5 sm-down:p-2 xs-down:p-1.5 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl xl-down:rounded-xl lg-down:rounded-xl md-down:rounded-lg sm-down:rounded-lg xs-down:rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-3 xl-down:px-5 xl-down:pt-5 xl-down:pb-2.5 lg-down:px-5 lg-down:pt-5 lg-down:pb-2.5 md-down:px-4 md-down:pt-4 md-down:pb-2 sm-down:px-3.5 sm-down:pt-3.5 sm-down:pb-2 xs-down:px-3 xs-down:pt-3 xs-down:pb-1.5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white xl-down:text-lg lg-down:text-lg md-down:text-base sm-down:text-base xs-down:text-sm">{t('modals.create.title')}</h2>
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
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:px-2 sm-down:py-1.5 sm-down:text-sm sm-down:rows-2 xs-down:px-2 xs-down:py-1 xs-down:text-xs"
              placeholder={t('modals.create.fields.contentPlaceholder')}
            />
          </div>

          {/* Media Section - Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              {t('modals.create.fields.media')}
            </label>
            <MediaTabs newNote={newNote} setNewNote={setNewNote} t={t} />
          </div>

          <div className="grid grid-cols-2 gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
                {t('modals.create.fields.category')}
              </label>
              <select
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:px-2 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs"
              >
                <option value="general">{t('category.general')}</option>
                <option value="work">{t('category.work')}</option>
                <option value="personal">{t('category.personal')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
                {t('modals.create.fields.priority')}
              </label>
              <select
                value={newNote.priority}
                onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:px-2 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs"
              >
                <option value="low">{t('priority.low')}</option>
                <option value="medium">{t('priority.medium')}</option>
                <option value="high">{t('priority.high')}</option>
              </select>
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
            disabled={!newNote.title.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 md-down:px-3 md-down:py-1.5 md-down:text-sm sm-down:px-2.5 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs"
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
