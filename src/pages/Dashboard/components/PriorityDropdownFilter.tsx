import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface PriorityDropdownFilterProps {
  selectedPriority: string;
  setSelectedPriority: (value: string) => void;
  t: any;
}

const PriorityDropdownFilter = memo(({
  selectedPriority,
  setSelectedPriority,
  t
}: PriorityDropdownFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const priorities = [
    { value: '', label: t('filters.allPriorities'), icon: null, color: '#6B7280' },
    { value: 'high', label: t('filters.priority.high'), icon: AlertCircle, color: '#EF4444' },
    { value: 'medium', label: t('filters.priority.medium'), icon: AlertTriangle, color: '#F59E0B' },
    { value: 'low', label: t('filters.priority.low'), icon: Info, color: '#10B981' }
  ];

  const selectedPriorityObj = priorities.find(p => p.value === selectedPriority) || priorities[0];

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
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 10060,
      });
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
        onClick={() => setIsOpen(!isOpen)}
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white lg-down:px-3.5 lg-down:py-2.5 md-down:px-3 md-down:py-2 sm-down:text-sm xs-down:text-xs flex items-center justify-between gap-2 min-w-[200px] md-down:min-w-[160px]"
      >
        <div className="flex items-center gap-2">
          {selectedPriorityObj.icon && (
            <selectedPriorityObj.icon className="w-4 h-4" style={{ color: selectedPriorityObj.color }} />
          )}
          <span style={{ color: selectedPriorityObj.value ? selectedPriorityObj.color : undefined }}>
            {selectedPriorityObj.label}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10060] pointer-events-none">
          <div ref={menuRef} style={menuStyle} className="pointer-events-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => {
                  setSelectedPriority(priority.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white flex items-center gap-2 sm-down:text-sm"
                style={{ backgroundColor: selectedPriority === priority.value ? `${priority.color}15` : undefined }}
                role="option"
                aria-selected={selectedPriority === priority.value}
              >
                {priority.icon && (
                  <priority.icon className="w-4 h-4 flex-shrink-0" style={{ color: priority.color }} />
                )}
                <span style={{ color: priority.value ? priority.color : undefined }}>{priority.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

PriorityDropdownFilter.displayName = 'PriorityDropdownFilter';

export default PriorityDropdownFilter;
