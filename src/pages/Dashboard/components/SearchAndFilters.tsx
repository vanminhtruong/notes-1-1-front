import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedPriority: string;
  setSelectedPriority: (value: string) => void;
  onCreateNote: () => void;
}

const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  onCreateNote
}: SearchAndFiltersProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="flex flex-col lg:flex-row gap-4 xl-down:gap-3.5 lg-down:gap-3 md-down:gap-2.5 sm-down:gap-2 xs-down:gap-1.5 mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 md-down:w-4 md-down:h-4 pointer-events-none z-10" />
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:py-2.5 md-down:py-2.5 md-down:pl-9 sm-down:text-sm xs-down:text-xs"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 lg-down:gap-2.5 md-down:gap-2 sm-down:flex-col xs-down:gap-1.5">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white lg-down:px-3.5 lg-down:py-2.5 md-down:px-3 md-down:py-2 sm-down:text-sm xs-down:text-xs"
        >
          <option value="">{t('filters.allCategories')}</option>
          <option value="work">{t('filters.category.work')}</option>
          <option value="personal">{t('filters.category.personal')}</option>
          <option value="general">{t('filters.category.general')}</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white lg-down:px-3.5 lg-down:py-2.5 md-down:px-3 md-down:py-2 sm-down:text-sm xs-down:text-xs"
        >
          <option value="">{t('filters.allPriorities')}</option>
          <option value="high">{t('filters.priority.high')}</option>
          <option value="medium">{t('filters.priority.medium')}</option>
          <option value="low">{t('filters.priority.low')}</option>
        </select>

        <button
          onClick={onCreateNote}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 lg-down:px-5 lg-down:py-2.5 md-down:px-4 md-down:py-2 sm-down:text-sm sm-down:gap-1.5 xs-down:text-xs xs-down:px-3 xs-down:py-1.5"
        >
          <Plus className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
          {t('actions.createNote')}
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilters;
