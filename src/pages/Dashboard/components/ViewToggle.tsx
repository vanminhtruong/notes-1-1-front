import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Folder, StickyNote, FileText, Archive, ArchiveX, Tag, Tags } from 'lucide-react';

type ViewMode = 'active' | 'archived' | 'folders' | 'tags';

interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
}

const ViewToggle = memo(({ viewMode, setViewMode }: ViewToggleProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="flex items-center gap-3 mb-6 lg-down:mb-5 md-down:mb-4 sm-down:gap-2.5 xs-down:gap-2">
      <button
        onClick={() => setViewMode('active')}
        className={`px-4 py-2 rounded-xl border transition-all duration-200 flex items-center gap-2 lg-down:px-3.5 lg-down:py-1.5 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1 sm-down:text-sm xs-down:text-xs ${
          viewMode === 'active'
            ? 'bg-blue-600 text-white border-transparent shadow-sm'
            : 'bg-white/70 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-white/20 dark:border-gray-700/30'
        }`}
      >
        {viewMode === 'active' ? (
          <StickyNote className="w-4 h-4 transition-transform duration-200" />
        ) : (
          <FileText className="w-4 h-4 transition-transform duration-200" />
        )}
        {t('view.active')}
      </button>
      <button
        onClick={() => setViewMode('archived')}
        className={`px-4 py-2 rounded-xl border transition-all duration-200 flex items-center gap-2 lg-down:px-3.5 lg-down:py-1.5 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1 sm-down:text-sm xs-down:text-xs ${
          viewMode === 'archived'
            ? 'bg-blue-600 text-white border-transparent shadow-sm'
            : 'bg-white/70 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-white/20 dark:border-gray-700/30'
        }`}
      >
        {viewMode === 'archived' ? (
          <Archive className="w-4 h-4 transition-transform duration-200" />
        ) : (
          <ArchiveX className="w-4 h-4 transition-transform duration-200" />
        )}
        {t('view.archived')}
      </button>
      <button
        onClick={() => setViewMode('folders')}
        className={`px-4 py-2 rounded-xl border transition-all duration-200 flex items-center gap-2 lg-down:px-3.5 lg-down:py-1.5 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1 sm-down:text-sm xs-down:text-xs ${
          viewMode === 'folders'
            ? 'bg-blue-600 text-white border-transparent shadow-sm'
            : 'bg-white/70 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-white/20 dark:border-gray-700/30'
        }`}
      >
        {viewMode === 'folders' ? (
          <FolderOpen className="w-4 h-4 transition-transform duration-200" />
        ) : (
          <Folder className="w-4 h-4 transition-transform duration-200" />
        )}
        {t('view.folders')}
      </button>
      <button
        onClick={() => setViewMode('tags')}
        className={`px-4 py-2 rounded-xl border transition-all duration-200 flex items-center gap-2 lg-down:px-3.5 lg-down:py-1.5 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1 sm-down:text-sm xs-down:text-xs ${
          viewMode === 'tags'
            ? 'bg-blue-600 text-white border-transparent shadow-sm'
            : 'bg-white/70 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border-white/20 dark:border-gray-700/30'
        }`}
      >
        {viewMode === 'tags' ? (
          <Tags className="w-4 h-4 transition-transform duration-200" />
        ) : (
          <Tag className="w-4 h-4 transition-transform duration-200" />
        )}
        Tags
      </button>
    </div>
  );
});

ViewToggle.displayName = 'ViewToggle';

export default ViewToggle;
export type { ViewMode };
