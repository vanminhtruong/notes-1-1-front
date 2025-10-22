import { memo, useState, useCallback } from 'react';
import { ChevronDown, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PriorityDropdownProps {
  value: 'low' | 'medium' | 'high';
  onChange: (priority: 'low' | 'medium' | 'high') => void;
}

const PriorityDropdown = memo(({ value, onChange }: PriorityDropdownProps) => {
  const { t } = useTranslation('dashboard');
  const [isOpen, setIsOpen] = useState(false);

  const priorities = [
    { value: 'low' as const, label: t('priority.low'), icon: Info, color: '#10B981' },
    { value: 'medium' as const, label: t('priority.medium'), icon: AlertTriangle, color: '#F59E0B' },
    { value: 'high' as const, label: t('priority.high'), icon: AlertCircle, color: '#EF4444' }
  ];

  const selectedPriority = priorities.find(p => p.value === value) || priorities[0];

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md-down:px-2.5 md-down:py-1.5 md-down:text-sm sm-down:px-2 sm-down:py-1.5 sm-down:text-sm xs-down:px-2 xs-down:py-1 xs-down:text-xs flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <selectedPriority.icon className="w-4 h-4 flex-shrink-0" style={{ color: selectedPriority.color }} />
          <span className="truncate" style={{ color: selectedPriority.color }}>{selectedPriority.label}</span>
        </span>
        <ChevronDown className="w-4 h-4 flex-shrink-0" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={handleClose}
          />
          <div className="absolute z-20 w-full bottom-full mb-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => {
                    onChange(priority.value);
                    handleClose();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm flex items-center gap-2 transition-colors"
                  style={{ 
                    backgroundColor: value === priority.value ? `${priority.color}15` : undefined 
                  }}
                >
                  <priority.icon className="w-4 h-4 flex-shrink-0" style={{ color: priority.color }} />
                  <span style={{ color: priority.color }}>{priority.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

PriorityDropdown.displayName = 'PriorityDropdown';

export default PriorityDropdown;
