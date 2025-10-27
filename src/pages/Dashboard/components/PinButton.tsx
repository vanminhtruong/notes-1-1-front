import { memo } from 'react';
import { Pin, PinOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type Note } from '@/services/notesService';
import { usePinNoteHandler } from '../hooks/Manager-handle/usePinNoteHandler';

interface PinButtonProps {
  note: Note;
  onPinUpdate?: (note: Note) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost';
  className?: string;
}

const PinButton = memo(({ 
  note, 
  onPinUpdate, 
  size = 'md',
  variant = 'default',
  className = '' 
}: PinButtonProps) => {
  const { t } = useTranslation('dashboard');
  const { isPinning, togglePin } = usePinNoteHandler(onPinUpdate, onPinUpdate);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await togglePin(note);
    } catch (error) {
      // Error already handled in hook with toast
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'p-1.5',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      button: 'p-2',
      icon: 'w-4 h-4',
    },
    lg: {
      button: 'p-2.5',
      icon: 'w-5 h-5',
    },
  };

  // Variant configurations  
  const variantConfig = {
    default: note.isPinned
      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200',
    ghost: note.isPinned
      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];
  const IconComponent = note.isPinned ? Pin : PinOff;

  return (
    <button
      onClick={handleClick}
      disabled={isPinning}
      className={`
        ${currentSize.button}
        ${currentVariant}
        rounded-lg 
        transition-all duration-200 
        flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-amber-400
        ${className}
      `}
      title={note.isPinned ? t('notes.unpinAction') : t('notes.pinAction')}
      aria-label={note.isPinned ? t('notes.unpinAction') : t('notes.pinAction')}
    >
      {isPinning ? (
        <Loader2 className={`${currentSize.icon} animate-spin`} />
      ) : (
        <IconComponent 
          className={`${currentSize.icon} ${note.isPinned ? 'fill-current' : ''}`} 
        />
      )}
    </button>
  );
});

PinButton.displayName = 'PinButton';

export default PinButton;
