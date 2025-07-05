import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { memo } from 'react';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-current',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2',
        xl: 'h-12 w-12 border-4',
      },
      variant: {
        default: 'border-t-transparent',
        dots: 'border-2 border-t-2 border-r-2 border-b-transparent border-l-transparent',
        pulse: 'border-2 border-t-transparent animate-pulse',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof spinnerVariants> {
  label?: string;
}

export const Spinner = memo<SpinnerProps>(({
  className,
  size,
  variant,
  label = 'Loading...',
  ...props
}) => {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
});

Spinner.displayName = 'Spinner';