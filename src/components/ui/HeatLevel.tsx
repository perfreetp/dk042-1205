import { Flame } from 'lucide-react';
import { cn } from '@/utils';

interface HeatLevelProps {
  level: number;
  showLabel?: boolean;
  className?: string;
}

export default function HeatLevel({ level, showLabel = false, className = '' }: HeatLevelProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              'w-1.5 h-3 rounded-sm transition-all',
              i <= level
                ? i <= 2
                  ? 'bg-cyan-400'
                  : i <= 4
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
                : 'bg-dark-bg-700'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500">
          <Flame className="w-3 h-3 inline mr-1" />
          {level}级热度
        </span>
      )}
    </div>
  );
}
