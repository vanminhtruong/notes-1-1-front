import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './StatsCards.scss';

interface StatsCardsProps {
  stats: {
    active: number;
    archived: number;
    totalFolders?: number;
    notesInFolders?: number;
  };
}

interface StatIconProps {
  variant: 'star' | 'archive' | 'folder' | 'file';
  tone: string;
  children: ReactNode;
}

const StatIcon = ({ variant, tone, children }: StatIconProps) => (
  <div
    className={`stats-card__icon-wrap stats-card__icon-wrap--${variant} ${tone} w-12 h-12 lg-down:w-10 lg-down:h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8`}
  >
    <svg
      className="stats-card__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  </div>
);

const StatsCards = memo(({ stats }: StatsCardsProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2 mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
      <div className="stats-card bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.active')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.active}</p>
          </div>
          <StatIcon variant="star" tone="bg-green-100 text-green-600">
            <path
              className="stats-card__star"
              d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
            />
          </StatIcon>
        </div>
      </div>
      <div className="stats-card bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.archived')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.archived}</p>
          </div>
          <StatIcon variant="archive" tone="bg-orange-100 text-orange-600">
            <rect className="stats-card__archive-lid" x="2" y="3" width="20" height="5" rx="1" />
            <path className="stats-card__archive-body" d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
            <path d="M10 12h4" />
          </StatIcon>
        </div>
      </div>
      <div className="stats-card bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.folders')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.totalFolders || 0}</p>
          </div>
          <StatIcon variant="folder" tone="bg-blue-100 text-blue-600">
            <path
              className="stats-card__folder-back"
              d="M3 8a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.6.8L12.2 8H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            />
            <path
              className="stats-card__folder-front"
              d="M3 11h18l-1.5 7.2a2 2 0 0 1-2 1.7H5.5a2 2 0 0 1-2-1.7z"
            />
          </StatIcon>
        </div>
      </div>
      <div className="stats-card bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm-down:text-xs">{t('stats.notesInFolders')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">{stats.notesInFolders || 0}</p>
          </div>
          <StatIcon variant="file" tone="bg-purple-100 text-purple-600">
            <path className="stats-card__file-page" d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path className="stats-card__file-line stats-card__file-line--1" d="M8 13h8" />
            <path className="stats-card__file-line stats-card__file-line--2" d="M8 17h5" />
          </StatIcon>
        </div>
      </div>
    </div>
  );
});

StatsCards.displayName = 'StatsCards';

export default StatsCards;
