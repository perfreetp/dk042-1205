import { cn } from '@/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'cyan';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
