import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, className = '', hover = false, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dark-bg-700/50 bg-dark-bg-800/40 backdrop-blur-sm transition-all duration-300',
        hover && 'hover:border-tech-cyan-500/30 hover:bg-dark-bg-800/60 hover:shadow-lg hover:shadow-tech-cyan-500/5 hover:-translate-y-0.5 cursor-pointer',
        glow && 'glow-border',
        className
      )}
    >
      {children}
    </div>
  );
}
