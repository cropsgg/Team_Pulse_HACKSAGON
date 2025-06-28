import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'shadow-medium border-border/50',
        interactive: 'hover:shadow-soft cursor-pointer hover:border-border/80',
        glass: 'backdrop-blur-md bg-card/80 border-border/50',
        outline: 'border-2 border-border shadow-none',
        gradient: 'bg-gradient-to-br from-card to-muted border-border/50',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Additional specialized card components
const CardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src: string;
    alt: string;
    aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  }
>(({ className, src, alt, aspectRatio = 'auto', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative overflow-hidden rounded-t-xl',
      {
        'aspect-square': aspectRatio === 'square',
        'aspect-video': aspectRatio === 'video',
        'aspect-[3/4]': aspectRatio === 'portrait',
      },
      className
    )}
    {...props}
  >
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
      loading="lazy"
    />
  </div>
));
CardImage.displayName = 'CardImage';

const CardBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      {
        'bg-primary/10 text-primary': variant === 'default',
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400': variant === 'success',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400': variant === 'warning',
        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400': variant === 'error',
        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400': variant === 'info',
      },
      className
    )}
    {...props}
  />
));
CardBadge.displayName = 'CardBadge';

const CardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    showImage?: boolean;
    lines?: number;
  }
>(({ className, showImage = true, lines = 3, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('animate-pulse rounded-xl border bg-card p-6', className)}
    {...props}
  >
    {showImage && (
      <div className="mb-4 h-48 rounded-lg bg-muted"></div>
    )}
    <div className="space-y-3">
      <div className="h-4 rounded bg-muted"></div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-muted"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        ></div>
      ))}
    </div>
  </div>
));
CardSkeleton.displayName = 'CardSkeleton';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
  CardBadge,
  CardSkeleton,
  cardVariants,
}; 