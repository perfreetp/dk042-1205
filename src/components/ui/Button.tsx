import { cn } from '@/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-tech-cyan-500 text-white hover:bg-tech-cyan-600 active:bg-tech-cyan-700 border-transparent',
  secondary: 'bg-dark-bg-700 text-slate-200 hover:bg-dark-bg-600 active:bg-dark-bg-500 border-transparent',
  ghost: 'bg-transparent text-slate-300 hover:bg-dark-bg-700/50 active:bg-dark-bg-700 border-transparent',
  outline: 'bg-transparent text-slate-300 border-dark-bg-600 hover:border-tech-cyan-500/50 hover:text-tech-cyan-400 border',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tech-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
