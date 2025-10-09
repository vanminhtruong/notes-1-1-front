import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { notesService, type NoteFolder, type Note } from '@/services/notesService';
import { getFolderIcon, getFolderColorClass } from '@/pages/Dashboard/utils/folderIcons';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

interface SearchFoldersProps {
  onSearch: (searchTerm: string) => void;
  onSelectFolder?: (folder: NoteFolder) => void;
  onSelectNote?: (note: Note & { folder?: NoteFolder }) => void;
  placeholder?: string;
}

const SearchFolders = ({ onSearch, onSelectFolder, onSelectNote, placeholder }: SearchFoldersProps) => {
  const { t } = useTranslation('dashboard');
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<{ folders: NoteFolder[]; notes: Note[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await notesService.searchFolders({ search: term });
        setSearchResults({
          folders: response.folders,
          notes: response.notes
        });
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim()) {
      setIsLoading(true);
      debouncedSearch(value);
    } else {
      setSearchResults(null);
      setShowResults(false);
      setIsLoading(false);
      onSearch('');
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSearchResults(null);
    setShowResults(false);
    onSearch('');
  };

  const handleSelectFolder = (folder: NoteFolder) => {
    setShowResults(false);
    if (onSelectFolder) {
      onSelectFolder(folder);
    }
  };

  const handleSelectNote = (note: Note & { folder?: NoteFolder }) => {
    setShowResults(false);
    if (onSelectNote) {
      onSelectNote(note);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 xl-down:pl-2.5 lg-down:pl-2.5 md-down:pl-2 sm-down:pl-2 xs-down:pl-1.5 pointer-events-none">
            <Search className="w-5 h-5 xl-down:w-4.5 xl-down:h-4.5 lg-down:w-4 lg-down:h-4 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5 xs-down:w-3.5 xs-down:h-3.5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder || t('folders.searchPlaceholder')}
            autoComplete="off"
            className="w-full pl-10 pr-10 py-3 xl-down:pl-9 xl-down:pr-9 xl-down:py-2.5 lg-down:pl-8 lg-down:pr-8 lg-down:py-2.5 md-down:pl-8 md-down:pr-8 md-down:py-2 sm-down:pl-7 sm-down:pr-7 sm-down:py-2 xs-down:pl-7 xs-down:pr-7 xs-down:py-1.5 text-base xl-down:text-sm lg-down:text-sm md-down:text-sm sm-down:text-xs xs-down:text-xs rounded-xl xl-down:rounded-lg lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md xs-down:rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
          />
          {(isLoading || inputValue) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 xl-down:pr-2.5 lg-down:pr-2.5 md-down:pr-2 sm-down:pr-2 xs-down:pr-1.5">
              {isLoading ? (
                <div className="w-5 h-5 xl-down:w-4.5 xl-down:h-4.5 lg-down:w-4 lg-down:h-4 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5 xs-down:w-3.5 xs-down:h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : inputValue ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 xl-down:p-0.5 lg-down:p-0.5 md-down:p-0.5 sm-down:p-0.5 xs-down:p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 lg-down:w-3.5 lg-down:h-3.5 md-down:w-3 md-down:h-3 sm-down:w-3 sm-down:h-3 xs-down:w-2.5 xs-down:h-2.5 text-gray-400 dark:text-gray-500" />
                </button>
              ) : null}
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchResults && (searchResults.folders.length > 0 || searchResults.notes.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 xl-down:mt-1.5 lg-down:mt-1.5 md-down:mt-1.5 sm-down:mt-1 xs-down:mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl xl-down:rounded-lg lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md xs-down:rounded-md shadow-lg max-h-96 xl-down:max-h-80 lg-down:max-h-72 md-down:max-h-64 sm-down:max-h-56 xs-down:max-h-48 overflow-y-auto z-50">
          {/* Folders Section */}
          {searchResults.folders.length > 0 && (
            <div className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-1.5 sm-down:p-1 xs-down:p-1">
              <div className="px-3 py-2 xl-down:px-2.5 xl-down:py-1.5 lg-down:px-2 lg-down:py-1.5 md-down:px-2 md-down:py-1 sm-down:px-1.5 sm-down:py-1 xs-down:px-1.5 xs-down:py-1 text-xs xl-down:text-[11px] lg-down:text-[10px] md-down:text-[10px] sm-down:text-[9px] xs-down:text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {t('folders.title')} ({searchResults.folders.length})
              </div>
              {searchResults.folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleSelectFolder(folder)}
                  className="w-full flex items-center gap-3 xl-down:gap-2.5 lg-down:gap-2 md-down:gap-2 sm-down:gap-1.5 xs-down:gap-1.5 px-3 py-2 xl-down:px-2.5 xl-down:py-1.5 lg-down:px-2 lg-down:py-1.5 md-down:px-2 md-down:py-1.5 sm-down:px-1.5 sm-down:py-1 xs-down:px-1.5 xs-down:py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg xl-down:rounded-md lg-down:rounded-md md-down:rounded sm-down:rounded xs-down:rounded transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    {(() => {
                      const IconComponent = getFolderIcon(folder.icon || 'folder');
                      const colorClass = getFolderColorClass(folder.color);
                      return <IconComponent className={`w-5 h-5 xl-down:w-4 xl-down:h-4 lg-down:w-4 lg-down:h-4 md-down:w-3.5 md-down:h-3.5 sm-down:w-3 sm-down:h-3 xs-down:w-3 xs-down:h-3 ${colorClass}`} strokeWidth={2} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate text-sm xl-down:text-sm lg-down:text-xs md-down:text-xs sm-down:text-xs xs-down:text-[11px]">
                      {folder.name}
                    </div>
                    <div className="text-sm xl-down:text-xs lg-down:text-xs md-down:text-[11px] sm-down:text-[10px] xs-down:text-[10px] text-gray-500 dark:text-gray-400">
                      {t('folders.notesCount', { count: folder.notesCount || 0 })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Notes Section */}
          {searchResults.notes.length > 0 && (
            <div className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-1.5 sm-down:p-1 xs-down:p-1 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2 xl-down:px-2.5 xl-down:py-1.5 lg-down:px-2 lg-down:py-1.5 md-down:px-2 md-down:py-1 sm-down:px-1.5 sm-down:py-1 xs-down:px-1.5 xs-down:py-1 text-xs xl-down:text-[11px] lg-down:text-[10px] md-down:text-[10px] sm-down:text-[9px] xs-down:text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {t('notes.title')} ({searchResults.notes.length})
              </div>
              {searchResults.notes.map((note: any) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className="w-full flex items-start gap-3 xl-down:gap-2.5 lg-down:gap-2 md-down:gap-2 sm-down:gap-1.5 xs-down:gap-1.5 px-3 py-2 xl-down:px-2.5 xl-down:py-1.5 lg-down:px-2 lg-down:py-1.5 md-down:px-2 md-down:py-1.5 sm-down:px-1.5 sm-down:py-1 xs-down:px-1.5 xs-down:py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg xl-down:rounded-md lg-down:rounded-md md-down:rounded sm-down:rounded xs-down:rounded transition-colors text-left"
                >
                  <FileText className="w-5 h-5 xl-down:w-4 xl-down:h-4 lg-down:w-4 lg-down:h-4 md-down:w-3.5 md-down:h-3.5 sm-down:w-3 sm-down:h-3 xs-down:w-3 xs-down:h-3 text-green-500 flex-shrink-0 mt-0.5 xl-down:mt-0.5 lg-down:mt-0 md-down:mt-0 sm-down:mt-0 xs-down:mt-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate text-sm xl-down:text-sm lg-down:text-xs md-down:text-xs sm-down:text-xs xs-down:text-[11px]">
                      {note.title}
                    </div>
                    {note.folder && (
                      <div className="text-xs xl-down:text-[11px] lg-down:text-[10px] md-down:text-[10px] sm-down:text-[9px] xs-down:text-[9px] text-gray-500 dark:text-gray-400 flex items-center gap-1 xl-down:gap-0.5 lg-down:gap-0.5 md-down:gap-0.5 sm-down:gap-0.5 xs-down:gap-0.5 mt-1 xl-down:mt-0.5 lg-down:mt-0.5 md-down:mt-0.5 sm-down:mt-0.5 xs-down:mt-0.5">
                        <Folder className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 lg-down:w-2.5 lg-down:h-2.5 md-down:w-2 md-down:h-2 sm-down:w-2 sm-down:h-2 xs-down:w-2 xs-down:h-2" />
                        <span className="truncate">{note.folder.name}</span>
                      </div>
                    )}
                    {note.content && (
                      <div className="text-sm xl-down:text-xs lg-down:text-xs md-down:text-[11px] sm-down:text-[10px] xs-down:text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 mt-1 xl-down:mt-0.5 lg-down:mt-0.5 md-down:mt-0.5 sm-down:mt-0.5 xs-down:mt-0.5">
                        {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {showResults && searchResults && searchResults.folders.length === 0 && searchResults.notes.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 xl-down:mt-1.5 lg-down:mt-1.5 md-down:mt-1.5 sm-down:mt-1 xs-down:mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl xl-down:rounded-lg lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md xs-down:rounded-md shadow-lg p-4 xl-down:p-3 lg-down:p-3 md-down:p-2.5 sm-down:p-2 xs-down:p-2 z-50">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm xl-down:text-sm lg-down:text-xs md-down:text-xs sm-down:text-xs xs-down:text-[11px]">
            {t('search.noResults')}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFolders;
