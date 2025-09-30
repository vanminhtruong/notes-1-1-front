import { useTranslation } from 'react-i18next';

export interface EditNote {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  reminderAtLocal: string;
}

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editNote: EditNote;
  setEditNote: (note: EditNote) => void;
  onSubmit: () => void;
}

const EditNoteModal = ({ isOpen, onClose, editNote, setEditNote, onSubmit }: EditNoteModalProps) => {
  const { t } = useTranslation('dashboard');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('modals.edit.title')}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('modals.create.fields.title')}
            </label>
            <input
              type="text"
              value={editNote.title}
              onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder={t('modals.create.fields.titlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('modals.create.fields.content')}
            </label>
            <textarea
              value={editNote.content}
              onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder={t('modals.create.fields.contentPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('modals.create.fields.image')}
            </label>
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
                    setEditNote({ ...editNote, imageUrl: url });
                  } catch (_err) {
                    // ignore
                  }
                }}
                className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {editNote.imageUrl && (
                <img src={editNote.imageUrl} alt="preview" className="w-12 h-12 rounded-md object-cover border" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('modals.create.fields.category')}
              </label>
              <select
                value={editNote.category}
                onChange={(e) => setEditNote({ ...editNote, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="general">{t('category.general')}</option>
                <option value="work">{t('category.work')}</option>
                <option value="personal">{t('category.personal')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('modals.create.fields.priority')}
              </label>
              <select
                value={editNote.priority}
                onChange={(e) => setEditNote({ ...editNote, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">{t('priority.low')}</option>
                <option value="medium">{t('priority.medium')}</option>
                <option value="high">{t('priority.high')}</option>
              </select>
            </div>
          </div>

          {/* Reminder datetime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('modals.create.fields.reminderAt')}
            </label>
            <input
              type="datetime-local"
              value={editNote.reminderAtLocal}
              onChange={(e) => setEditNote({ ...editNote, reminderAtLocal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('modals.create.fields.reminderHint')}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={onSubmit}
            disabled={!editNote.title.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {t('actions.update')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;
