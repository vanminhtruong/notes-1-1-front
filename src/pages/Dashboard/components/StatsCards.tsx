import { memo } from 'react';
import { Star, Archive, Folder, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatsCardsProps {
  stats: {
    active: number;
    archived: number;
    totalFolders?: number;
    notesInFolders?: number;
  };
}

const StatsCards = memo(({ stats }: StatsCardsProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2 mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
      <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.active')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.active}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center lg-down:w-10 lg-down:h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8">
            <Star className="w-6 h-6 text-green-600 lg-down:w-5 lg-down:h-5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
          </div>
        </div>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.archived')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.archived}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center lg-down:w-10 lg-down:h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8">
            <Archive className="w-6 h-6 text-orange-600 lg-down:w-5 lg-down:h-5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
          </div>
        </div>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.folders')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.totalFolders || 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center lg-down:w-10 lg-down:h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8">
            <Folder className="w-6 h-6 text-blue-600 lg-down:w-5 lg-down:h-5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
          </div>
        </div>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.notesInFolders')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.notesInFolders || 0}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center lg-down:w-10 lg-down:h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8">
            <FileText className="w-6 h-6 text-purple-600 lg-down:w-5 lg-down:h-5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
});

StatsCards.displayName = 'StatsCards';

export default StatsCards;
