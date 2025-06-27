'use client';

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  max?: number;
  showPercentage?: boolean;
  variant?: 'default' | 'charity' | 'impact' | 'gradient';
  size?: 'sm' | 'default' | 'lg';
  targetDate?: string | Date;
  unit?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, max = 100, showPercentage = false, variant = 'default', size = 'default', targetDate, unit = '', ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const countdown = useCountdown(targetDate || new Date());
  
  const sizeClasses = {
    sm: 'h-2',
    default: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-primary',
    charity: 'bg-charity-500',
    impact: 'bg-impact-500',
    gradient: 'bg-gradient-to-r from-charity-500 to-impact-500'
  };

  return (
    <div className="space-y-1">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "flex-1 w-full transition-all duration-500 ease-in-out",
            variantClasses[variant],
            sizeClasses[size]
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
      {showPercentage && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value.toLocaleString()} {unit}</span>
          <span>{max.toLocaleString()} {unit} ({percentage.toFixed(1)}%)</span>
        </div>
      )}
      {targetDate && countdown && !countdown.isExpired && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Time remaining:</span>
          <span>
            {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
          </span>
        </div>
      )}
      {targetDate && countdown?.isExpired && (
        <div className="text-xs text-red-500 font-medium">
          Deadline expired
        </div>
      )}
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }; 