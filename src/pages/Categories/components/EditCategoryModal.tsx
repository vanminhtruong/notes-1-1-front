import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Tag, Hash, Bookmark, Star, Heart, Zap, Flag, Award, Target,
  TrendingUp, Activity, AlertCircle, CheckCircle, Info, Lightbulb,
  Sparkles, Crown, Gift, Bell, Calendar, Clock, MapPin, Globe
} from 'lucide-react';
import { type NoteCategory } from '@/services/notesService';

interface EditCategoryModalProps {
  isOpen: boolean;
  category: NoteCategory | null;
  onClose: () => void;
  onSubmit: (id: number, data: { name: string; color: string; icon: string }) => Promise<void>;
}

const COLORS = [
  { value: '#3B82F6', name: 'blue', preview: 'bg-blue-500' },
  { value: '#10B981', name: 'green', preview: 'bg-green-500' },
  { value: '#EF4444', name: 'red', preview: 'bg-red-500' },
  { value: '#F59E0B', name: 'yellow', preview: 'bg-yellow-500' },
  { value: '#8B5CF6', name: 'purple', preview: 'bg-purple-500' },
  { value: '#EC4899', name: 'pink', preview: 'bg-pink-500' },
  { value: '#F97316', name: 'orange', preview: 'bg-orange-500' },
  { value: '#6B7280', name: 'gray', preview: 'bg-gray-500' },
  { value: '#06B6D4', name: 'cyan', preview: 'bg-cyan-500' },
  { value: '#14B8A6', name: 'teal', preview: 'bg-teal-500' },
  { value: '#A855F7', name: 'violet', preview: 'bg-violet-500' },
  { value: '#D946EF', name: 'fuchsia', preview: 'bg-fuchsia-500' },
];

const ICONS = [
  { name: 'Tag', icon: Tag },
  { name: 'Hash', icon: Hash },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Zap', icon: Zap },
  { name: 'Flag', icon: Flag },
  { name: 'Award', icon: Award },
  { name: 'Target', icon: Target },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Activity', icon: Activity },
  { name: 'AlertCircle', icon: AlertCircle },
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'Info', icon: Info },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Crown', icon: Crown },
  { name: 'Gift', icon: Gift },
  { name: 'Bell', icon: Bell },
  { name: 'Calendar', icon: Calendar },
  { name: 'Clock', icon: Clock },
  { name: 'MapPin', icon: MapPin },
  { name: 'Globe', icon: Globe },
];

const EditCategoryModal = ({ isOpen, category, onClose, onSubmit }: EditCategoryModalProps) => {
  const { t } = useTranslation('categories');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Tag');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsSubmitting(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
      setIcon(category.icon || 'Tag');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    // Tối ưu: Đóng modal ngay, không chờ API
    const categoryId = category.id;
    const updateData = { name: name.trim(), color, icon };
    onClose();

    // Gọi API trong background
    setIsSubmitting(true);
    try {
      await onSubmit(categoryId, updateData);
    } catch (error) {
      console.error('Edit category error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm-down:p-3 xs-down:p-2.5 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl md-down:rounded-xl shadow-2xl w-full max-w-md md-down:max-w-sm xs-down:max-w-[92%] max-h-[90vh] flex flex-col overflow-hidden transform transition-all">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl md-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 md-down:w-4.5 md-down:h-4.5 sm-down:w-4 sm-down:h-4" />
            {t('editCategory')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 md-down:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5">
          <form onSubmit={handleSubmit} id="edit-category-form" className="space-y-4 md-down:space-y-3.5 sm-down:space-y-3 xs-down:space-y-3">
            {/* Category Name */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('categoryName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('categoryNamePlaceholder')}
                className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 xs-down:px-3 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md-down:text-xs"
                maxLength={100}
                required
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('categoryColor')}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`w-10 h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8 rounded-full border-4 transition-all ${colorOption.preview} ${
                      color === colorOption.value
                        ? 'ring-4 ring-blue-300 dark:ring-blue-600 ring-offset-2 dark:ring-offset-gray-800 scale-110'
                        : 'hover:scale-105 border-white dark:border-gray-800'
                    }`}
                    title={colorOption.name}
                    style={{ borderColor: 'white' }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('categoryIcon')}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      onClick={() => setIcon(iconOption.name)}
                      className={`w-12 h-12 md-down:w-11 md-down:h-11 sm-down:w-10 sm-down:h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                        icon === iconOption.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      <IconComponent 
                        className="w-6 h-6 md-down:w-5 md-down:h-5 sm-down:w-4.5 sm-down:h-4.5" 
                        strokeWidth={2}
                        style={{ 
                          color: icon === iconOption.name ? color : undefined 
                        }}
                      />
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
              {t('cancel')}
            </button>
            <button
              type="submit"
              form="edit-category-form"
              className="flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md-down:text-xs"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryModal;
