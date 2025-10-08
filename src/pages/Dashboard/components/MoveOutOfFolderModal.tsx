import { memo } from 'react';
import { X, FolderOutput, Archive, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MoveOutOfFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoveToActive: () => void;
  onMoveToArchived: () => void;
  noteTitle: string;
}

const MoveOutOfFolderModal = memo(({ isOpen, onClose, onMoveToActive, onMoveToArchived, noteTitle }: MoveOutOfFolderModalProps) => {
  const { t } = useTranslation('dashboard');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderOutput className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {t('folders.moveOutOfFolder')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {noteTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('folders.selectDestination')}
          </p>

          <div className="space-y-3">
            {/* Move to Active */}
            <button
              onClick={onMoveToActive}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 group"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {t('folders.moveToActive')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('folders.moveToActiveDesc')}
                </p>
              </div>
            </button>

            {/* Move to Archived */}
            <button
              onClick={onMoveToArchived}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-200 group"
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {t('folders.moveToArchived')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('folders.moveToArchivedDesc')}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            {t('actions.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
});

MoveOutOfFolderModal.displayName = 'MoveOutOfFolderModal';

export default MoveOutOfFolderModal;
