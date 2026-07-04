import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-canvas-soft text-body border border-border',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-canvas-soft text-body',
        destructive: 'bg-error-soft text-error-deep',
        success: 'bg-link-bg-soft text-link',
        warning: 'bg-warning-soft text-warning-deep',
        info: 'bg-cyan-soft text-cyan-deep',
        violet: 'bg-violet-soft text-violet-deep',
        muted: 'bg-canvas-soft text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
