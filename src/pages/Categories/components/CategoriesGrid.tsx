import { useEffect, useMemo, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Edit2, Trash2, Eye } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { type NoteCategory } from '@/services/notesService';
import * as LucideIcons from 'lucide-react';

interface CategoriesGridProps {
  categories: NoteCategory[];
  isLoading: boolean;
  onEdit: (category: NoteCategory) => void;
  onDelete: (category: NoteCategory) => void;
  onView: (category: NoteCategory) => void;
}

// Tối ưu: Sử dụng memo để tránh re-render không cần thiết
const CategoriesGrid = memo(({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onView,
}: CategoriesGridProps) => {
  const { t } = useTranslation('categories');
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredCategories.length, totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const displayedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, currentPage]);

  // Tối ưu: Memoize icon lookup để tránh lookup mỗi render
  const getCategoryIcon = useMemo(() => {
    const iconCache = new Map<string, any>();
    return (iconName: string) => {
      if (!iconCache.has(iconName)) {
        iconCache.set(iconName, (LucideIcons as any)[iconName] || Tag);
      }
      return iconCache.get(iconName);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (categories.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Tag className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('noCategories')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {t('noCategoriesDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 xl-down:space-y-3 lg-down:space-y-3 md-down:space-y-2.5 sm-down:space-y-2 xs-down:space-y-2">
      {/* Search */}
      <div className="mb-6 xl-down:mb-5 lg-down:mb-5 md-down:mb-4 sm-down:mb-3 xs-down:mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 md-down:px-3 md-down:py-1.5 sm-down:text-sm"
        />
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {filteredCategories.length > 0 ? (
            t('foundResults', { count: filteredCategories.length })
          ) : (
            t('noResults')
          )}
        </div>
      )}

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl-down:gap-3.5 lg-down:gap-3 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2">
          {displayedCategories.map((category) => {
            const IconComponent = getCategoryIcon(category.icon);
            return (
              <div
                key={category.id}
                className="group bg-white dark:bg-gray-800 rounded-xl xl-down:rounded-lg lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Category Icon - Centered */}
                <div 
                  className="p-6 xl-down:p-5 lg-down:p-5 md-down:p-4 sm-down:p-4 xs-down:p-3 flex items-center justify-center border-b border-gray-100 dark:border-gray-700"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <IconComponent 
                    className="w-16 h-16 xl-down:w-14 xl-down:h-14 lg-down:w-12 lg-down:h-12 md-down:w-10 md-down:h-10 sm-down:w-10 sm-down:h-10" 
                    style={{ color: category.color }}
                    strokeWidth={1.5} 
                  />
                </div>

                {/* Category Content */}
                <div className="p-4 xl-down:p-3 lg-down:p-3 md-down:p-3 sm-down:p-2.5 xs-down:p-2">
                  <h3 className="text-lg xl-down:text-base lg-down:text-base md-down:text-sm sm-down:text-sm xs-down:text-sm font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {category.name}
                  </h3>
                  <p className="text-sm xs-down:text-xs text-gray-600 dark:text-gray-400 mb-4 sm-down:mb-3 xs-down:mb-2.5">
                    {t('notesCount', { count: category.notesCount || 0 })}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 sm-down:gap-2 xs-down:gap-1.5">
                    <button
                      onClick={() => onView(category)}
                      className="flex items-center justify-center px-3 py-2 md-down:px-2.5 md-down:py-1.5 sm-down:px-2 sm-down:py-1.5 xs-down:px-2 xs-down:py-1.5 border border-blue-300 dark:border-blue-600 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title={t('viewNotes')}
                    >
                      <Eye className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 md-down:px-2.5 md-down:py-1.5 sm-down:px-2 sm-down:py-1.5 xs-down:px-2 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md-down:text-xs"
                    >
                      <Edit2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                      <span className="text-sm md-down:text-xs">{t('edit')}</span>
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      className="flex items-center justify-center px-3 py-2 md-down:px-2.5 md-down:py-1.5 sm-down:px-2 sm-down:py-1.5 xs-down:px-2 xs-down:py-1.5 border border-red-300 dark:border-red-600 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : searchTerm ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Tag className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('noResults')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            {t('tryDifferentKeywords')}
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {totalPages >= 2 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
});

CategoriesGrid.displayName = 'CategoriesGrid';

export default CategoriesGrid;
