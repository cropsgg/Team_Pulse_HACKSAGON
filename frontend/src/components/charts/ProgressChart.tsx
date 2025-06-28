import React from 'react';

interface ProgressChartProps {
  current: number;
  target: number;
  color?: string;
  size?: number;
  className?: string;
}

export function ProgressChart({ 
  current, 
  target, 
  color = '#ef4444', 
  size = 120,
  className 
}: ProgressChartProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
        <div className="text-xs text-muted-foreground text-center">
          ₹{(current / 100000).toFixed(1)}L / ₹{(target / 100000).toFixed(1)}L
        </div>
      </div>
    </div>
  );
} 