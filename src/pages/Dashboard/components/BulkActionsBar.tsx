import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BulkActionsBarProps {
  selectedCount: number;
  showArchived: boolean;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

const BulkActionsBar = ({ selectedCount, showArchived, onClearSelection, onBulkDelete }: BulkActionsBarProps) => {
  const { t } = useTranslation('dashboard');

  if (selectedCount === 0 || showArchived) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-2xl
                    flex items-center justify-between bg-white/70 dark:bg-gray-800/90 
                    backdrop-blur-lg rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-2xl
                    animate-in slide-in-from-bottom duration-300
                    lg-down:p-3.5 md-down:p-3 md-down:bottom-4 sm-down:flex-col sm-down:gap-3 sm-down:items-stretch xs-down:w-[calc(100%-1rem)] xs-down:bottom-3">
      <div className="text-sm text-gray-900 dark:text-white font-semibold md-down:text-xs sm-down:text-center">
        {t('messages.selectedCount', { count: selectedCount })}
      </div>
      <div className="flex gap-2 sm-down:gap-2 sm-down:w-full">
        <button
          onClick={onClearSelection}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-all hover:scale-105 active:scale-95 md-down:px-3 md-down:py-1.5 md-down:text-xs sm-down:flex-1"
        >
          {t('actions.clearSelection')}
        </button>
        <button
          onClick={onBulkDelete}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg md-down:px-3 md-down:py-1.5 md-down:text-xs md-down:gap-1.5 sm-down:flex-1"
        >
          <Trash2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
          {t('actions.deleteSelected')}
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
