import { Star, StarOff } from 'lucide-react';
import { cn } from '@/utils';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export default function FavoriteButton({ isFavorite, onClick, size = 'md', className = '' }: FavoriteButtonProps) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'p-1.5 rounded-lg transition-all duration-200',
        isFavorite
          ? 'text-amber-400 hover:bg-amber-500/10'
          : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10',
        className
      )}
    >
      {isFavorite ? (
        <Star className={cn(sizeClasses, 'fill-current')} />
      ) : (
        <StarOff className={sizeClasses} />
      )}
    </button>
  );
}
