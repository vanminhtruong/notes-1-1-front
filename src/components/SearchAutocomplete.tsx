import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, FileText, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { notesService } from '@/services/notesService';
import type { SearchSuggestion } from '@/services/notesService';
import { useTranslation } from 'react-i18next';
import LazyLoad from './LazyLoad';

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchAutocomplete = ({ onSearch, placeholder }: SearchAutocompleteProps) => {
  const { t } = useTranslation('dashboard');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const suppressNextOpenRef = useRef<boolean>(false);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      // Khi rỗng, trả list đầy đủ real-time
      if (onSearch) onSearch('');
      return;
    }

    setIsLoading(true);
    try {
      const response = await notesService.searchAutocomplete(searchQuery);
      setSuggestions(response.suggestions);
      setIsOpen(response.suggestions.length > 0);
      // Đồng bộ search real-time (debounced theo useEffect)
      if (onSearch) onSearch(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Bỏ qua lần debounce kế tiếp ngay sau khi chọn suggestion/nhấn Enter
      if (suppressNextOpenRef.current) {
        suppressNextOpenRef.current = false;
        setIsOpen(false);
        return;
      }
      performSearch(query);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tính và cập nhật vị trí dropdown theo input (dùng fixed + portal để tránh stacking context)
  const updateDropdownPosition = useCallback(() => {
    const el = containerRef.current || inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - 16; // 16px padding từ bottom
    const maxHeight = Math.min(spaceBelow, 500); // Tối đa 500px hoặc không gian còn lại
    setDropdownPos({ 
      top: rect.bottom + 8, 
      left: rect.left, 
      width: rect.width,
      maxHeight: Math.max(maxHeight, 200) // Tối thiểu 200px
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
      
      // Ngăn scroll của body khi dropdown mở (bù trừ độ rộng scrollbar để tránh lệch vị trí)
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';

      // Sau khi khóa scroll, layout có thể dịch chuyển -> cập nhật lại vị trí dropdown
      requestAnimationFrame(() => {
        updateDropdownPosition();
      });
      
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen, updateDropdownPosition]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[0]?.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    const nextQuery = suggestion.title || '';
    setQuery(nextQuery);
    setIsOpen(false);
    setSelectedIndex(-1);
    suppressNextOpenRef.current = true;
    // Cập nhật list notes theo query thay vì mở modal
    if (onSearch && nextQuery.trim()) {
      onSearch(nextQuery);
    }
  };

  const handleSearch = () => {
    if (onSearch && query.trim()) {
      onSearch(query);
      setIsOpen(false);
      suppressNextOpenRef.current = true;
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    if (onSearch) onSearch('');
  };

  // Highlight matched text
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white font-medium rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Tag;
  };

  const getPriorityIcon = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'w-2 h-2 bg-red-500 rounded-full',
      medium: 'w-2 h-2 bg-yellow-500 rounded-full',
      low: 'w-2 h-2 bg-green-500 rounded-full',
    };
    return colors[priority] || 'w-2 h-2 bg-gray-500 rounded-full';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('search.today', 'Hôm nay');
    if (diffDays === 1) return t('search.yesterday', 'Hôm qua');
    if (diffDays < 7) return `${diffDays} ${t('search.daysAgo', 'ngày trước')}`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div ref={containerRef} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder || t('search.placeholder', 'Tìm kiếm ghi chú...')}
          autoComplete="off"
          className="w-full pl-8 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
        />
        {(query || isLoading) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
            {isLoading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <button
                onClick={handleClear}
                className="p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dropdown Suggestions (Portal) */}
      {isOpen && suggestions.length > 0 && dropdownPos && createPortal(
        <div
          ref={dropdownRef}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-2xl overflow-y-auto"
          style={{
            position: 'fixed',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
            maxHeight: `${dropdownPos.maxHeight}px`,
            zIndex: 100000,
            backdropFilter: 'blur(8px)'
          }}
          onWheel={(e) => {
            // Ngăn scroll lan ra desktop - chỉ cho phép scroll trong dropdown
            e.stopPropagation();
          }}
        >
          <div className="py-1 sm:py-2">
            {suggestions.map((suggestion, index) => (
              <LazyLoad
                key={suggestion.id}
                threshold={0.1}
                rootMargin="50px"
                animationDuration={200}
                delay={index * 30}
                reAnimate={false}
              >
                <button
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 transition-all border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 ${
                    selectedIndex === index
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-sm'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                    {/* Icon */}
                    <div className={`mt-0.5 p-1 sm:p-1.5 md:p-2 rounded-md sm:rounded-lg ${
                      suggestion.matchType === 'title' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                          {highlightText(suggestion.title, query)}
                        </h4>
                        <div className={getPriorityIcon(suggestion.priority)} />
                      </div>

                      {/* Snippet */}
                      {suggestion.snippet && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-1.5 md:mb-2">
                          {highlightText(suggestion.snippet, query)}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-wrap">
                        {suggestion.category && (() => {
                          const Icon = getCategoryIcon(suggestion.category.icon);
                          return (
                            <span 
                              className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-white/50 dark:bg-gray-800/50 border"
                              style={{ 
                                borderColor: suggestion.category.color + '40',
                                backgroundColor: suggestion.category.color + '10',
                                color: suggestion.category.color
                              }}
                            >
                              <Icon className="w-3 h-3" style={{ color: suggestion.category.color }} />
                              {suggestion.category.name}
                            </span>
                          );
                        })()}
                        <span className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(suggestion.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Match Type Badge */}
                    <div className="hidden md:flex flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        suggestion.matchType === 'title'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {suggestion.matchType === 'title' ? t('search.matchInTitle', 'Tiêu đề') : t('search.matchInContent', 'Nội dung')}
                      </span>
                    </div>
                  </div>
                </button>
              </LazyLoad>
            ))}
          </div>

          {/* Footer */}
          <div className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('search.found', 'Tìm thấy')} <span className="font-semibold">{suggestions.length}</span> {t('search.results', 'kết quả')}
              <span className="hidden sm:inline">
                {' • '}
                {t('search.pressEnter', 'Nhấn Enter để tìm kiếm đầy đủ')}
              </span>
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* No Results (Portal) */}
      {isOpen && !isLoading && query.trim() && suggestions.length === 0 && dropdownPos && createPortal(
        <div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-5 md:p-6"
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 100000 }}
        >
          <div className="text-center">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium mb-1">
              {t('search.noResults', 'Không tìm thấy kết quả')}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
              {t('search.tryDifferent', 'Thử tìm kiếm với từ khóa khác')}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SearchAutocomplete;
