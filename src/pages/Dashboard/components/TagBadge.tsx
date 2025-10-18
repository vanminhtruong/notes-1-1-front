import type { NoteTag } from '@/services/notesService';

interface TagBadgeProps {
  tag: NoteTag;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TagBadge = ({ tag, onClick, size = 'md', className = '' }: TagBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] md-down:text-[9px]',
    md: 'px-2.5 py-1 text-xs md-down:text-[10px]',
    lg: 'px-3 py-1.5 text-sm md-down:text-xs',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-medium text-white transition-all ${
        sizeClasses[size]
      } ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''} ${className}`}
      style={{ backgroundColor: tag.color }}
    >
      <span className="truncate max-w-[120px] md-down:max-w-[100px]">{tag.name}</span>
    </Component>
  );
};

export default TagBadge;
