import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

const BulkActionsBar = ({ selectedCount, onClearSelection, onBulkDelete }: BulkActionsBarProps) => {
  const { t } = useTranslation('dashboard');

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 border border-white/20 dark:border-gray-700/30 mb-4 lg-down:p-3.5 md-down:p-3 sm-down:flex-col sm-down:gap-3 sm-down:items-start">
      <div className="text-sm text-gray-700 dark:text-gray-200 md-down:text-xs">
        {t('messages.selectedCount', { count: selectedCount })}
      </div>
      <div className="flex gap-2 sm-down:gap-1.5">
        <button
          onClick={onClearSelection}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm md-down:px-2.5 md-down:py-1 md-down:text-xs"
        >
          {t('actions.clearSelection')}
        </button>
        <button
          onClick={onBulkDelete}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-1 md-down:px-2.5 md-down:py-1 md-down:text-xs md-down:gap-0.5"
        >
          <Trash2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
          {t('actions.deleteSelected')}
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
