import { cn } from '@/lib/utils';

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({ name, color, onRemove, className }: TagBadgeProps) {
  // Convert hex color to rgba with 0.3 opacity for background
  const bgColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`;
  
  return (
    <div 
      className={cn(
        "flex items-center px-2 py-0.5 rounded-full text-xs",
        className
      )}
      style={{ backgroundColor: bgColor, color: color }}
    >
      <span>{name}</span>
      {onRemove && (
        <button onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }} className="ml-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
