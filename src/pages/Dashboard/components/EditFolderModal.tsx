import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Folder, DollarSign, Book, GraduationCap, Pencil, Leaf,
  Code, Smile, Music, Popcorn, Wrench, Palette,
  Sprout, Flower, Camera, BarChart, Star, Dumbbell,
  ClipboardList, Scale, Search, Plane, Globe, Settings,
  Footprints, FlaskConical, Trophy, Heart, Coffee, Target
} from 'lucide-react';
import { type NoteFolder } from '@/services/notesService';

interface EditFolderModalProps {
  isOpen: boolean;
  folder: NoteFolder | null;
  onClose: () => void;
  onSubmit: (id: number, data: { name: string; color: string; icon: string }) => Promise<void>;
}

const COLORS = [
  { value: 'blue', class: 'text-blue-500 border-blue-500' },
  { value: 'green', class: 'text-green-500 border-green-500' },
  { value: 'red', class: 'text-red-500 border-red-500' },
  { value: 'yellow', class: 'text-yellow-500 border-yellow-500' },
  { value: 'purple', class: 'text-purple-500 border-purple-500' },
  { value: 'pink', class: 'text-pink-500 border-pink-500' },
  { value: 'orange', class: 'text-orange-500 border-orange-500' },
  { value: 'gray', class: 'text-gray-500 border-gray-500' },
];

const ICONS = [
  { name: 'folder', icon: Folder },
  { name: 'dollar', icon: DollarSign },
  { name: 'book', icon: Book },
  { name: 'graduation', icon: GraduationCap },
  { name: 'pencil', icon: Pencil },
  { name: 'leaf', icon: Leaf },
  { name: 'code', icon: Code },
  { name: 'smile', icon: Smile },
  { name: 'music', icon: Music },
  { name: 'popcorn', icon: Popcorn },
  { name: 'wrench', icon: Wrench },
  { name: 'palette', icon: Palette },
  { name: 'sprout', icon: Sprout },
  { name: 'flower', icon: Flower },
  { name: 'camera', icon: Camera },
  { name: 'chart', icon: BarChart },
  { name: 'star', icon: Star },
  { name: 'dumbbell', icon: Dumbbell },
  { name: 'clipboard', icon: ClipboardList },
  { name: 'scale', icon: Scale },
  { name: 'search', icon: Search },
  { name: 'plane', icon: Plane },
  { name: 'globe', icon: Globe },
  { name: 'settings', icon: Settings },
  { name: 'footprints', icon: Footprints },
  { name: 'flask', icon: FlaskConical },
  { name: 'trophy', icon: Trophy },
  { name: 'heart', icon: Heart },
  { name: 'coffee', icon: Coffee },
  { name: 'target', icon: Target },
];

const EditFolderModal = ({ isOpen, folder, onClose, onSubmit }: EditFolderModalProps) => {
  const { t } = useTranslation('dashboard');
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Ensure button state is reset each time the modal opens
      setIsSubmitting(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setColor(folder.color);
      setIcon(folder.icon || '');
    }
  }, [folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !folder) return;

    setIsSubmitting(true);
    try {
      await onSubmit(folder.id, { name: name.trim(), color, icon });
      onClose();
    } catch (error) {
      console.error('Update folder error:', error);
    } finally {
      // Always reset submitting state so reopening the modal doesn't get stuck
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !folder) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm-down:p-3 xs-down:p-2.5 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl md-down:rounded-xl shadow-2xl w-full max-w-lg md-down:max-w-md xs-down:max-w-[92%] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl md-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Folder className="w-5 h-5 md-down:w-4 md-down:h-4" />
            {t('folders.editFolder') || 'Chỉnh sửa thư mục'}
          </h2>
          <button onClick={onClose} className="p-2 md-down:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5">
          <form onSubmit={handleSubmit} id="edit-folder-form" className="space-y-4 md-down:space-y-3.5 sm-down:space-y-3">
            {/* Folder Name */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Tên thư mục *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên thư mục..."
                required
                className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 xs-down:px-3 xs-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm md-down:text-xs"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{t('folders.folderColor')}</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`w-10 h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8 rounded-full border-4 ${colorOption.class} transition-all bg-white dark:bg-gray-800 ${
                      color === colorOption.value ? 'ring-4 ring-blue-300 dark:ring-blue-600 ring-offset-2 dark:ring-offset-gray-800 scale-110' : 'hover:scale-105'
                    }`}
                    title={t(`folders.colors.${colorOption.value}`)}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{t('folders.folderIcon') || 'Icon'}</label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  const selectedColor = COLORS.find(c => c.value === color);
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      onClick={() => setIcon(iconOption.name)}
                      className={`w-12 h-12 md-down:w-11 md-down:h-11 sm-down:w-10 sm-down:h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                        icon === iconOption.name
                          ? `${selectedColor?.class} bg-gray-50 dark:bg-gray-700/50 scale-110`
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 md-down:w-5 md-down:h-5 sm-down:w-4.5 sm-down:h-4.5" strokeWidth={2} />
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 sm-down:flex-col sm-down:gap-2">
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
              form="edit-folder-form"
              className="flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md-down:text-xs"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? t('actions.saving') : t('actions.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;
