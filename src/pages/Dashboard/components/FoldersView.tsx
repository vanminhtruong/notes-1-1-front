import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Folder, Edit2, Trash2, ChevronRight, Plus } from 'lucide-react';
import Pagination from '@/components/Pagination';
import SearchFolders from '@/components/SearchFolders';
import { type NoteFolder, notesService } from '@/services/notesService';

interface FoldersViewProps {
  folders: NoteFolder[];
  isLoading: boolean;
  onCreateFolder: () => void;
  onEditFolder: (folder: NoteFolder) => void;
  onDeleteFolder: (folder: NoteFolder) => void;
  onViewFolder: (folder: NoteFolder) => void;
}

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-500',
};

const FoldersView = ({
  folders,
  isLoading,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onViewFolder,
}: FoldersViewProps) => {
  const { t } = useTranslation('dashboard');
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ folders: NoteFolder[]; notes: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Determine which folders to display
  const foldersToDisplay = searchTerm && searchResults ? searchResults.folders : folders;
  const totalPages = Math.max(1, Math.ceil(foldersToDisplay.length / PAGE_SIZE));

  // Đảm bảo currentPage không vượt quá totalPages khi dữ liệu thay đổi
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [foldersToDisplay.length, totalPages, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const displayedFolders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return foldersToDisplay.slice(start, start + PAGE_SIZE);
  }, [foldersToDisplay, currentPage]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await notesService.searchFolders({ search: term });
      setSearchResults({
        folders: results.folders,
        notes: results.notes
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFolder = (folder: NoteFolder) => {
    onViewFolder(folder);
  };

  const handleSelectNote = (note: any) => {
    // If note has a folder, navigate to that folder
    if (note.folder) {
      onViewFolder(note.folder);
    }
  };

  if (isLoading || isSearching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (folders.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Folder className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('folders.noFolders')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {t('folders.noFoldersDesc')}
        </p>
        <button
          onClick={onCreateFolder}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {t('folders.createFolder')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 xl-down:space-y-3 lg-down:space-y-3 md-down:space-y-2.5 sm-down:space-y-2 xs-down:space-y-2">
      {/* Search and Create Button */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 xl-down:mb-5 lg-down:mb-5 md-down:mb-4 sm-down:mb-3 xs-down:mb-3">
        <div className="flex-1">
          <SearchFolders
            onSearch={handleSearch}
            onSelectFolder={handleSelectFolder}
            onSelectNote={handleSelectNote}
            placeholder={t('folders.searchPlaceholder')}
          />
        </div>
        <button
          onClick={onCreateFolder}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md md-down:px-3 md-down:py-1.5 sm-down:px-3 sm-down:py-1.5 xs-down:px-2.5 xs-down:py-1.5 text-sm md-down:text-xs whitespace-nowrap self-start lg:self-auto"
        >
          <Plus className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-4 xs-down:h-4" />
          {t('folders.createFolder')}
        </button>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {foldersToDisplay.length > 0 ? (
            <>
              {t('search.foundResults', { count: foldersToDisplay.length })}
              {searchResults && searchResults.notes.length > 0 && (
                <span className="ml-2">
                  ({searchResults.notes.length} {t('notes.inFolders')})
                </span>
              )}
            </>
          ) : (
            t('search.noResults')
          )}
        </div>
      )}

      {/* Folders Grid */}
      {foldersToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl-down:gap-3.5 lg-down:gap-3 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2">
          {displayedFolders.map((folder) => (
          <div
            key={folder.id}
            className="group bg-white dark:bg-gray-800 rounded-xl xl-down:rounded-lg lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Folder Header */}
            <div
              className={`${COLOR_CLASSES[folder.color] || COLOR_CLASSES.blue} p-4 xl-down:p-3 lg-down:p-3 md-down:p-3 sm-down:p-2.5 xs-down:p-2 cursor-pointer`}
              onClick={() => onViewFolder(folder)}
            >
              <div className="flex items-center justify-between text-white">
                {folder.icon && folder.icon !== 'folder' ? (
                  <div className="text-3xl xl-down:text-2xl lg-down:text-2xl md-down:text-2xl sm-down:text-xl xs-down:text-lg leading-none">{folder.icon}</div>
                ) : (
                  <Folder className="w-8 h-8 xl-down:w-7 xl-down:h-7 lg-down:w-7 lg-down:h-7 md-down:w-6 md-down:h-6 sm-down:w-6 sm-down:h-6 xs-down:w-5 xs-down:h-5" />
                )}
                <ChevronRight className="w-5 h-5 xl-down:w-4 xl-down:h-4 md-down:w-4 md-down:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Folder Content */}
            <div className="p-4 xl-down:p-3 lg-down:p-3 md-down:p-3 sm-down:p-2.5 xs-down:p-2">
              <h3
                className="text-lg xl-down:text-base lg-down:text-base md-down:text-sm sm-down:text-sm xs-down:text-sm font-semibold text-gray-900 dark:text-white mb-2 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => onViewFolder(folder)}
              >
                {folder.name}
              </h3>
              <p className="text-sm xs-down:text-xs text-gray-600 dark:text-gray-400 mb-4 sm-down:mb-3 xs-down:mb-2.5">
                {t('folders.notesCount', { count: folder.notesCount || 0 })}
              </p>

              {/* Actions */}
              <div className="flex gap-2 sm-down:gap-2 xs-down:gap-1.5">
                <button
                  onClick={() => onEditFolder(folder)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 md-down:px-2.5 md-down:py-1.5 sm-down:px-2 sm-down:py-1.5 xs-down:px-2 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md-down:text-xs"
                >
                  <Edit2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                  <span className="text-sm md-down:text-xs">{t('actions.edit')}</span>
                </button>
                <button
                  onClick={() => onDeleteFolder(folder)}
                  className="flex items-center justify-center px-3 py-2 md-down:px-2.5 md-down:py-1.5 sm-down:px-2 sm-down:py-1.5 xs-down:px-2 xs-down:py-1.5 border border-red-300 dark:border-red-600 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      ) : searchTerm ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Folder className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('search.noResults')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            {t('search.tryDifferentKeywords')}
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {foldersToDisplay.length > PAGE_SIZE && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(foldersToDisplay.length / PAGE_SIZE)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default FoldersView;
