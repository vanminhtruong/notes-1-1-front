import { memo, useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ChevronDown, Filter, X, Sparkles, Tag, Check, SlidersHorizontal, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import PriorityDropdownFilter from './PriorityDropdownFilter';
import * as LucideIcons from 'lucide-react';

// Category Dropdown Component với thiết kế mới
const CategoryDropdown = memo(({
  categories,
  selectedCategory,
  setSelectedCategory,
  t,
  onLoadCategories
}: {
  categories: Array<{ id: number; name: string; color: string; icon: string }>;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  t: any;
  onLoadCategories?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const hasLoadedRef = useRef(false);

  const selectedCat = categories.find(c => c.id.toString() === selectedCategory);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !hasLoadedRef.current && categories.length === 0 && onLoadCategories) {
      hasLoadedRef.current = true;
      onLoadCategories();
    }
  };

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
      const viewportHeight = window.innerHeight;
      const menuHeight = 320; // max-h-[320px]
      const spaceBelow = viewportHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;

      // Ưu tiên hiển thị phía dưới, nhưng nếu không đủ space và space trên nhiều hơn thì đảo lên trên
      const preferBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;

      if (preferBelow) {
        setMenuStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          left: rect.left,
          minWidth: Math.max(rect.width, 240),
          maxHeight: Math.min(spaceBelow, 320),
          zIndex: 10060,
        });
      } else {
        // Hiển thị phía trên
        const actualMenuHeight = Math.min(spaceAbove, 320);
        setMenuStyle({
          position: 'fixed',
          top: rect.top - actualMenuHeight - 8,
          left: rect.left,
          minWidth: Math.max(rect.width, 240),
          maxHeight: actualMenuHeight,
          zIndex: 10060,
        });
      }
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
        onClick={handleOpen}
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          group relative px-4 py-2.5 
          bg-white/80 dark:bg-gray-800/80 
          backdrop-blur-xl 
          border-2 rounded-2xl 
          transition-all duration-300 ease-out
          flex items-center justify-between gap-3 
          min-w-[180px] md-down:min-w-[140px]
          hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5
          hover:border-blue-400/50 dark:hover:border-blue-500/50
          hover:-translate-y-0.5
          ${isOpen
            ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10'
            : selectedCat
              ? 'border-blue-400/60 dark:border-blue-500/60'
              : 'border-gray-200/80 dark:border-gray-700/80'
          }
        `}
      >
        <div className="flex items-center gap-2.5">
          <div className={`
            p-1.5 rounded-lg transition-all duration-300
            ${selectedCat
              ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
              : 'bg-gray-100 dark:bg-gray-700/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
            }
          `}>
            {selectedCat ? (
              (() => {
                const Icon = getCategoryIcon(selectedCat.icon);
                return <Icon className="w-4 h-4" style={{ color: selectedCat.color }} />;
              })()
            ) : (
              <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
              {t('filters.categoryLabel') || 'Category'}
            </span>
            <span className={`text-sm font-medium transition-colors ${selectedCat
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
              }`}>
              {selectedCat ? selectedCat.name : t('filters.allCategories')}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'group-hover:text-gray-600'}`} />

        {/* Active indicator dot */}
        {selectedCat && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        )}
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10060] pointer-events-none">
          <div
            ref={menuRef}
            style={menuStyle}
            className="
              pointer-events-auto 
              bg-white/95 dark:bg-gray-800/95 
              backdrop-blur-xl
              border border-gray-200/50 dark:border-gray-700/50 
              rounded-2xl 
              shadow-2xl shadow-black/10 dark:shadow-black/30
              overflow-y-auto
              animate-in fade-in-0 zoom-in-95 duration-200
              scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
            "
          >
            {/* Header */}
            <div className="sticky top-0 px-4 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('filters.selectCategory') || 'Select Category'}
                </span>
              </div>
            </div>

            {/* All categories option */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-3 text-left 
                transition-all duration-200 
                flex items-center gap-3 
                group/item
                ${!selectedCategory
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                }
              `}
              role="option"
            >
              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 group-hover/item:bg-gray-200 dark:group-hover/item:bg-gray-600/50 transition-colors">
                <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('filters.allCategories')}</span>
              {!selectedCategory && <Check className="w-4 h-4 ml-auto text-blue-500" />}
            </button>

            {/* Divider */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

            {/* Categories list */}
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const isSelected = selectedCategory === cat.id.toString();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id.toString());
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-left 
                    transition-all duration-200 
                    flex items-center gap-3 
                    group/item
                    ${isSelected
                      ? 'border-l-2 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? `${cat.color}15` : undefined
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div
                    className="p-1.5 rounded-lg transition-all duration-200 group-hover/item:scale-110"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{cat.name}</span>
                  {isSelected && <Check className="w-4 h-4 ml-auto text-blue-500" />}
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
  onLoadCategories?: () => void;
}

const SearchAndFilters = memo(({
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  onCreateNote,
  showArchived = false,
  categories,
  onLoadCategories
}: SearchAndFiltersProps) => {
  const { t } = useTranslation('dashboard');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedPriority) count++;
    return count;
  }, [selectedCategory, selectedPriority]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedPriority('');
  };

  // Toggle filters visibility với animation
  const toggleFilters = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (isFiltersVisible) {
      // Closing animation
      if (filtersRef.current) {
        filtersRef.current.style.animation = 'filtersSlideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      }
      setTimeout(() => {
        setIsFiltersVisible(false);
        setIsAnimating(false);
      }, 400);
    } else {
      // Opening
      setIsFiltersVisible(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  // Auto-show filters if any filter is active
  useEffect(() => {
    if (activeFiltersCount > 0 && !isFiltersVisible) {
      setIsFiltersVisible(true);
    }
  }, [activeFiltersCount]);

  return (
    <div className="mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
      {/* Inject keyframes for animations */}
      <style>{`
        @keyframes filtersSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
            filter: blur(10px);
          }
          50% {
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        
        @keyframes filtersSlideOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
          50% {
            filter: blur(5px);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
            filter: blur(10px);
          }
        }
        
        @keyframes magicGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(139, 92, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(139, 92, 246, 0.3);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(2deg);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }

        .filters-magic-button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          background-size: 200% 200%;
          animation: shimmer 3s ease infinite;
        }

        .filters-magic-button:hover {
          animation: magicGlow 1.5s ease-in-out infinite, shimmer 3s ease infinite;
        }

        .filters-panel-enter {
          animation: filtersSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Main Search Bar with Toggle Button */}
      <div className="
        relative overflow-visible
        bg-gradient-to-br from-white/70 via-white/50 to-white/70 
        dark:from-gray-800/70 dark:via-gray-800/50 dark:to-gray-800/70
        backdrop-blur-xl
        border border-white/40 dark:border-gray-700/40
        rounded-2xl
        p-4 xl-down:p-3.5 lg-down:p-3 md-down:p-2.5
        shadow-lg shadow-black/5 dark:shadow-black/15
        transition-all duration-300
      ">
        <div className="flex items-center gap-3 md-down:gap-2">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
              <SearchAutocomplete
                onSearch={setSearchTerm}
                placeholder={t('search.placeholder')}
              />
            </div>
          </div>

          {/* Magic Filter Toggle Button Wrapper */}
          <div className="relative group transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 z-10">
            <button
              onClick={toggleFilters}
              disabled={isAnimating}
              className={`
                filters-magic-button
                relative
                flex items-center gap-2.5
                px-5 py-3 md-down:px-4 md-down:py-2.5 sm-down:px-3 sm-down:py-2
                text-white rounded-xl
                disabled:cursor-wait
                overflow-hidden
                w-full h-full
              `}
            >
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/60 rounded-full"
                  style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/40 rounded-full"
                  style={{ animation: 'sparkle 2.5s ease-in-out infinite 0.5s' }} />
                <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/50 rounded-full"
                  style={{ animation: 'sparkle 2s ease-in-out infinite 1s' }} />
              </div>

              {/* Shine sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <div className="relative flex items-center gap-2">
                {isFiltersVisible ? (
                  <SlidersHorizontal className="w-5 h-5 md-down:w-4 md-down:h-4 transition-transform group-hover:rotate-12" style={{ animation: 'float 2s ease-in-out infinite' }} />
                ) : (
                  <Wand2 className="w-5 h-5 md-down:w-4 md-down:h-4 transition-transform group-hover:rotate-12" style={{ animation: 'float 2s ease-in-out infinite' }} />
                )}
                <span className="font-semibold text-sm md-down:text-xs hidden sm:block">
                  {isFiltersVisible ? (t('filters.hideFilters') || 'Hide') : (t('filters.showFilters') || 'Filters')}
                </span>
              </div>
            </button>

            {/* Active filters count badge - MOVED OUTSIDE BUTTON */}
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-white text-purple-600 text-[10px] font-bold rounded-full shadow-lg border-2 border-purple-500 animate-bounce z-20 pointer-events-none">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {/* Create Note Button - Always visible */}
          {!showArchived && (
            <button
              onClick={onCreateNote}
              className="
                group relative flex items-center gap-2
                px-5 py-3 md-down:px-4 md-down:py-2.5 sm-down:px-3 sm-down:py-2
                bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500
                text-white rounded-xl
                transition-all duration-300
                transform hover:scale-105 hover:-translate-y-0.5
                shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35
                overflow-hidden
              "
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <div className="relative flex items-center gap-2">
                <Plus className="w-5 h-5 md-down:w-4 md-down:h-4 transition-transform group-hover:rotate-90 duration-300" />
                <span className="font-semibold text-sm md-down:text-xs hidden sm:block">{t('actions.createNote')}</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filters Panel */}
      {isFiltersVisible && (
        <div
          ref={filtersRef}
          className="filters-panel-enter mt-4"
        >
          <div className="
            relative overflow-hidden
            bg-gradient-to-br from-white/80 via-white/60 to-white/80 
            dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/80
            backdrop-blur-xl
            border border-white/50 dark:border-gray-700/50
            rounded-3xl
            p-6 xl-down:p-5 lg-down:p-4 md-down:p-3
            shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/5
          ">
            {/* Magical decorative elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-radial from-purple-500/5 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />

            {/* Header with filter indicator */}
            <div className="flex items-center justify-between gap-4 mb-5 xl-down:mb-4 lg-down:mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white xl-down:text-base flex items-center gap-2">
                    {t('filters.title') || 'Search & Filters'}
                    <Sparkles className="w-4 h-4 text-purple-500" style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('filters.subtitle') || 'Find your notes quickly'}
                  </p>
                </div>
              </div>

              {/* Active filters badge and reset */}
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2 animate-in slide-in-from-right-5 duration-300">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-purple-500/20">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-[10px] font-bold text-white shadow-lg">
                        {activeFiltersCount}
                      </span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {t('filters.activeFilters') || 'Active'}
                      </span>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="
                        flex items-center gap-1.5 px-3 py-1.5 
                        rounded-full 
                        bg-red-500/10 hover:bg-red-500/20 
                        border border-red-500/20 hover:border-red-500/30
                        text-red-600 dark:text-red-400 
                        text-xs font-medium
                        transition-all duration-200
                        hover:scale-105
                      "
                    >
                      <X className="w-3 h-3" />
                      {t('filters.clearAll') || 'Clear'}
                    </button>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={toggleFilters}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors group-hover:rotate-90 duration-300" />
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 lg-down:gap-2.5 md-down:gap-2 relative z-10">
              {/* Category Filter */}
              <CategoryDropdown
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                t={t}
                onLoadCategories={onLoadCategories}
              />

              {/* Priority Filter */}
              <PriorityDropdownFilter
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
                t={t}
              />
            </div>

            {/* Quick filter chips */}
            {categories.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-200/40 dark:border-gray-700/40 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t('filters.quickFilters') || 'Quick:'}
                  </span>
                  {categories.slice(0, 5).map((cat, index) => {
                    const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.Tag;
                    const isActive = selectedCategory === cat.id.toString();
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(isActive ? '' : cat.id.toString())}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 
                          rounded-full text-xs font-medium
                          transition-all duration-300
                          hover:scale-110 hover:-translate-y-0.5
                          ${isActive
                            ? 'shadow-lg'
                            : 'hover:shadow-md'
                          }
                        `}
                        style={{
                          backgroundColor: isActive ? `${cat.color}30` : `${cat.color}15`,
                          color: cat.color,
                          borderWidth: '1.5px',
                          borderColor: isActive ? cat.color : `${cat.color}50`,
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {cat.name}
                        {isActive && <X className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

SearchAndFilters.displayName = 'SearchAndFilters';

export default SearchAndFilters;
