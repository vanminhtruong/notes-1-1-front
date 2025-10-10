import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import { type NoteCategory } from '@/services/notesService';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  category: NoteCategory | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

const DeleteCategoryModal = ({ isOpen, category, onClose, onConfirm }: DeleteCategoryModalProps) => {
  const { t } = useTranslation('categories');
  const [isDeleting, setIsDeleting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsDeleting(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!category) return;

    setIsDeleting(true);
    try {
      await onConfirm(category.id);
      onClose();
    } catch (error) {
      console.error('Delete category error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm-down:p-3 xs-down:p-2.5 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl md-down:rounded-xl shadow-2xl w-full max-w-md md-down:max-w-sm xs-down:max-w-[92%] overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl md-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 md-down:w-4.5 md-down:h-4.5 sm-down:w-4 sm-down:h-4 text-red-500" />
            {t('deleteCategory')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 md-down:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 md-down:text-base sm-down:text-sm">
              {t('deleteConfirmTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 md-down:text-xs">
              {t('deleteConfirmMessage', { name: category.name })}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 md-down:text-xs">
              {t('deleteConfirmNote')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3 sm-down:flex-col-reverse sm-down:gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors text-sm md-down:text-xs"
              disabled={isDeleting}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md-down:text-xs"
              disabled={isDeleting}
            >
              {isDeleting ? t('deleting') : t('delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal;
