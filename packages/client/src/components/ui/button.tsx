import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]',
        secondary:
          'bg-card text-foreground border border-border hover:bg-muted',
        ghost:
          'bg-transparent text-foreground hover:bg-muted',
        destructive:
          'bg-destructive text-destructive-foreground hover:opacity-90',
        link:
          'bg-transparent text-link underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
        default: 'h-10 px-4 text-sm rounded-full gap-2',
        lg: 'h-12 px-6 text-base rounded-full gap-2',
        icon: 'h-10 w-10 rounded-full',
        'icon-sm': 'h-8 w-8 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
