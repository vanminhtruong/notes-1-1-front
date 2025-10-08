import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Folder } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; color: string; icon: string }) => Promise<void>;
}

const COLORS = [
  { value: 'blue', class: 'bg-blue-500' },
  { value: 'green', class: 'bg-green-500' },
  { value: 'red', class: 'bg-red-500' },
  { value: 'yellow', class: 'bg-yellow-500' },
  { value: 'purple', class: 'bg-purple-500' },
  { value: 'pink', class: 'bg-pink-500' },
  { value: 'orange', class: 'bg-orange-500' },
  { value: 'gray', class: 'bg-gray-500' },
];

const ICONS = [
  '📁', '💰', '📖', '🎓', '✏️', '🍃',
  '💻', '😊', '🎵', '🍿', '🛠️', '🎨',
  '🌱', '🪷', '📷', '📊', '⭐', '💪',
  '📋', '⚖️', '🔍', '✈️', '🌐', '🔧',
  '🐾', '🧪', '⚾', '❤️', '☕', '🎯'
];

const CreateFolderModal = ({ isOpen, onClose, onSubmit }: CreateFolderModalProps) => {
  const { t } = useTranslation('dashboard');
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('📁');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), color, icon: icon || '📁' });
      setName('');
      setColor('blue');
      setIcon('📁');
      onClose();
    } catch (error) {
      console.error('Create folder error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm-down:p-3 xs-down:p-2.5 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl md-down:rounded-xl shadow-2xl w-full max-w-md md-down:max-w-sm xs-down:max-w-[92%] transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl md-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Folder className="w-5 h-5 md-down:w-4.5 md-down:h-4.5 sm-down:w-4 sm-down:h-4" />
            {t('folders.createFolder')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 md-down:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 space-y-4 md-down:space-y-3.5 sm-down:space-y-3 xs-down:space-y-3">
          {/* Folder Name */}
          <div>
            <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('folders.folderName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('folders.folderNamePlaceholder')}
              className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 xs-down:px-3 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md-down:text-xs"
              maxLength={100}
              required
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('folders.folderColor')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`w-10 h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8 rounded-lg ${colorOption.class} transition-all ${
                    color === colorOption.value
                      ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={t(`folders.colors.${colorOption.value}`)}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('folders.folderIcon') || 'Icon'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((iconOption) => (
                <button
                  key={iconOption}
                  type="button"
                  onClick={() => setIcon(iconOption)}
                  className={`w-12 h-12 md-down:w-11 md-down:h-11 sm-down:w-10 sm-down:h-10 text-2xl md-down:text-xl sm-down:text-lg rounded-lg border-2 transition-all ${
                    icon === iconOption
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 hover:scale-105'
                  }`}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 sm-down:flex-col sm-down:gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md-down:text-xs"
              disabled={isSubmitting}
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md-down:text-xs"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? t('actions.saving') || 'Đang lưu...' : t('actions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
