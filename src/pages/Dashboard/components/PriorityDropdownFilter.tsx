import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, AlertCircle, AlertTriangle, Info, Gauge, Check, Sparkles } from 'lucide-react';

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
    { value: '', label: t('filters.allPriorities'), icon: Sparkles, color: '#6B7280', gradient: 'from-gray-400 to-gray-500' },
    { value: 'high', label: t('filters.priority.high'), icon: AlertCircle, color: '#EF4444', gradient: 'from-red-500 to-rose-600' },
    { value: 'medium', label: t('filters.priority.medium'), icon: AlertTriangle, color: '#F59E0B', gradient: 'from-amber-500 to-orange-500' },
    { value: 'low', label: t('filters.priority.low'), icon: Info, color: '#10B981', gradient: 'from-emerald-500 to-teal-500' }
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
      const viewportHeight = window.innerHeight;
      const menuHeight = 280; // estimated max menu height
      const spaceBelow = viewportHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;

      // Ưu tiên hiển thị phía dưới, nhưng nếu không đủ space và space trên nhiều hơn thì đảo lên trên
      const preferBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;

      if (preferBelow) {
        setMenuStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          left: rect.left,
          minWidth: Math.max(rect.width, 200),
          maxHeight: Math.min(spaceBelow, 280),
          zIndex: 10060,
        });
      } else {
        // Hiển thị phía trên
        const actualMenuHeight = Math.min(spaceAbove, 280);
        setMenuStyle({
          position: 'fixed',
          top: rect.top - actualMenuHeight - 8,
          left: rect.left,
          minWidth: Math.max(rect.width, 200),
          maxHeight: actualMenuHeight,
          zIndex: 10060,
        });
      }
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
        className={`
          group relative px-4 py-2.5 
          bg-white/80 dark:bg-gray-800/80 
          backdrop-blur-xl 
          border-2 rounded-2xl 
          transition-all duration-300 ease-out
          flex items-center justify-between gap-3 
          min-w-[180px] md-down:min-w-[140px]
          hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5
          hover:border-blue-400/50 dark:hover:border-blue-500/50
          hover:-translate-y-0.5
          ${isOpen
            ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10'
            : selectedPriority
              ? 'border-blue-400/60 dark:border-blue-500/60'
              : 'border-gray-200/80 dark:border-gray-700/80'
          }
        `}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: selectedPriority ? `${selectedPriorityObj.color}20` : undefined,
            }}
          >
            {selectedPriorityObj.icon && (
              <selectedPriorityObj.icon
                className="w-4 h-4 transition-colors"
                style={{ color: selectedPriorityObj.color }}
              />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
              {t('filters.priorityLabel') || 'Priority'}
            </span>
            <span
              className="text-sm font-medium transition-colors"
              style={{ color: selectedPriority ? selectedPriorityObj.color : undefined }}
            >
              {selectedPriorityObj.label}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'group-hover:text-gray-600'}`} />

        {/* Active indicator dot */}
        {selectedPriority && (
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"
            style={{ backgroundColor: selectedPriorityObj.color }}
          />
        )}
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10060] pointer-events-none">
          <div
            ref={menuRef}
            style={menuStyle}
            className="
              pointer-events-auto 
              bg-white/95 dark:bg-gray-800/95 
              backdrop-blur-xl
              border border-gray-200/50 dark:border-gray-700/50 
              rounded-2xl 
              shadow-2xl shadow-black/10 dark:shadow-black/30
              overflow-y-auto
              animate-in fade-in-0 zoom-in-95 duration-200
              scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
            "
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('filters.selectPriority') || 'Select Priority'}
                </span>
              </div>
            </div>

            {/* Priority options */}
            {priorities.map((priority) => {
              const isSelected = selectedPriority === priority.value;
              return (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => {
                    setSelectedPriority(priority.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-left 
                    transition-all duration-200 
                    flex items-center gap-3 
                    group/item
                    ${isSelected
                      ? 'border-l-2 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? `${priority.color}15` : undefined
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div
                    className="p-1.5 rounded-lg transition-all duration-200 group-hover/item:scale-110"
                    style={{ backgroundColor: `${priority.color}20` }}
                  >
                    <priority.icon className="w-4 h-4 flex-shrink-0" style={{ color: priority.color }} />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-medium"
                      style={{ color: priority.value ? priority.color : undefined }}
                    >
                      {priority.label}
                    </span>
                    {priority.value && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {priority.value === 'high' && (t('filters.priority.highDesc') || 'Urgent tasks')}
                        {priority.value === 'medium' && (t('filters.priority.mediumDesc') || 'Important tasks')}
                        {priority.value === 'low' && (t('filters.priority.lowDesc') || 'Can wait')}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 ml-auto text-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

PriorityDropdownFilter.displayName = 'PriorityDropdownFilter';

export default PriorityDropdownFilter;
