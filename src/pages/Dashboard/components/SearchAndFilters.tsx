import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import * as LucideIcons from 'lucide-react';

// Category Dropdown Component
const CategoryDropdown = memo(({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  t 
}: { 
  categories: Array<{ id: number; name: string; color: string; icon: string }>; 
  selectedCategory: string; 
  setSelectedCategory: (value: string) => void; 
  t: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const selectedCat = categories.find(c => c.id.toString() === selectedCategory);

  const getCategoryIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Tag;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideButton = !!buttonRef.current && buttonRef.current.contains(target);
      const clickedInsideMenu = !!menuRef.current && menuRef.current.contains(target);
      const clickedInsideWrapper = !!dropdownRef.current && dropdownRef.current.contains(target);

      if (!clickedInsideButton && !clickedInsideMenu && !clickedInsideWrapper) {
        setIsOpen(false);
      }
    };

    const updateMenuPosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 10060,
      });
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      updateMenuPosition();
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative z-[10002]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white lg-down:px-3.5 lg-down:py-2.5 md-down:px-3 md-down:py-2 sm-down:text-sm xs-down:text-xs flex items-center justify-between gap-2 min-w-[200px] md-down:min-w-[160px]"
      >
        <div className="flex items-center gap-2">
          {selectedCat ? (
            <>
              {(() => {
                const Icon = getCategoryIcon(selectedCat.icon);
                return <Icon className="w-4 h-4" style={{ color: selectedCat.color }} />;
              })()}
              <span>{selectedCat.name}</span>
            </>
          ) : (
            <span>{t('filters.allCategories')}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10060] pointer-events-none">
          <div ref={menuRef} style={menuStyle} className="pointer-events-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white flex items-center gap-2 sm-down:text-sm"
              role="option"
            >
              <span>{t('filters.allCategories')}</span>
            </button>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id.toString());
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white flex items-center gap-2 sm-down:text-sm"
                  style={{ backgroundColor: selectedCategory === cat.id.toString() ? `${cat.color}15` : undefined }}
                  role="option"
                  aria-selected={selectedCategory === cat.id.toString()}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

CategoryDropdown.displayName = 'CategoryDropdown';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedPriority: string;
  setSelectedPriority: (value: string) => void;
  onCreateNote: () => void;
  showArchived?: boolean;
  categories: Array<{ id: number; name: string; color: string; icon: string }>;
}

const SearchAndFilters = memo(({
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  onCreateNote,
  showArchived = false,
  categories
}: SearchAndFiltersProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="flex flex-col lg:flex-row gap-4 xl-down:gap-3.5 lg-down:gap-3 md-down:gap-2.5 sm-down:gap-2 xs-down:gap-1.5 mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
      {/* Search Autocomplete */}
      <div className="flex-1 relative z-[10000]">
        <SearchAutocomplete
          onSearch={setSearchTerm}
          placeholder={t('search.placeholder')}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3 lg-down:gap-2.5 md-down:gap-2 sm-down:flex-col xs-down:gap-1.5 relative z-[10002]">
        <CategoryDropdown
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          t={t}
        />

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

        {!showArchived && (
          <button
            onClick={onCreateNote}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 lg-down:px-5 lg-down:py-2.5 md-down:px-4 md-down:py-2 sm-down:text-sm sm-down:gap-1.5 xs-down:text-xs xs-down:px-3 xs-down:py-1.5"
          >
            <Plus className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
            {t('actions.createNote')}
          </button>
        )}
      </div>
    </div>
  );
});

SearchAndFilters.displayName = 'SearchAndFilters';

export default SearchAndFilters;
