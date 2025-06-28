"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProgressChartProps {
  current: number;
  target: number;
  className?: string;
  showLabels?: boolean;
  color?: string;
}

export function ProgressChart({ 
  current, 
  target, 
  className = "",
  showLabels = true,
  color = "#ef4444"
}: ProgressChartProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg width="120" height="120" className="transform -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {showLabels && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-lg font-bold" style={{ color }}>
            {percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">
            ₹{(current / 100000).toFixed(1)}L / ₹{(target / 100000).toFixed(1)}L
          </div>
        </div>
      )}
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number; date?: string }[];
  height?: number;
  className?: string;
  color?: string;
  showTrend?: boolean;
}

export function LineChart({ 
  data, 
  height = 200, 
  className = "",
  color = "#ef4444",
  showTrend = true
}: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const padding = 40;
  const width = 400;
  
  const getX = (index: number) => padding + (index * (width - 2 * padding)) / (data.length - 1);
  const getY = (value: number) => height - padding - ((value - minValue) / (maxValue - minValue)) * (height - 2 * padding);

  const pathData = data.map((d, i) => {
    const x = getX(i);
    const y = getY(d.value);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const trend = data.length > 1 ? data[data.length - 1].value - data[0].value : 0;

  return (
    <div className={`${className}`}>
      {showTrend && (
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-1">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : trend < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
            <span className={`text-sm font-medium ${
              trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {trend > 0 ? '+' : ''}{((trend / data[0].value) * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            vs. first data point
          </span>
        </div>
      )}
      
      <svg width={width} height={height} className="w-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <g stroke="#e5e7eb" strokeWidth="1" opacity="0.3">
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i * (height - 2 * padding)) / 4;
            return (
              <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} />
            );
          })}
        </g>
        
        {/* Area under the line */}
        <path
          d={`${pathData} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`}
          fill="url(#lineGradient)"
        />
        
        {/* Line */}
        <path
          d={pathData}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d.value)}
            r="4"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
        
        {/* Y-axis labels */}
        <g fill="#6b7280" fontSize="12" textAnchor="end">
          {[0, 1, 2, 3, 4].map(i => {
            const value = minValue + (i * (maxValue - minValue)) / 4;
            const y = height - padding - (i * (height - 2 * padding)) / 4;
            return (
              <text key={i} x={padding - 10} y={y + 4}>
                {value.toLocaleString()}
              </text>
            );
          })}
        </g>
        
        {/* X-axis labels */}
        <g fill="#6b7280" fontSize="12" textAnchor="middle">
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 6) === 0) {
              return (
                <text key={i} x={getX(i)} y={height - 10}>
                  {d.label}
                </text>
              );
            }
            return null;
          })}
        </g>
      </svg>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export function BarChart({ data, height = 200, className = "" }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const padding = 40;
  const width = 400;
  const barWidth = (width - 2 * padding) / data.length - 10;

  return (
    <div className={className}>
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        <g stroke="#e5e7eb" strokeWidth="1" opacity="0.3">
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i * (height - 2 * padding)) / 4;
            return (
              <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} />
            );
          })}
        </g>
        
        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 2 * padding);
          const x = padding + i * ((width - 2 * padding) / data.length);
          const y = height - padding - barHeight;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={d.color || "#ef4444"}
              rx="4"
              className="hover:opacity-80 transition-opacity"
            />
          );
        })}
        
        {/* Value labels on bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 2 * padding);
          const x = padding + i * ((width - 2 * padding) / data.length) + barWidth / 2;
          const y = height - padding - barHeight - 5;
          
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
              fontWeight="500"
            >
              {d.value.toLocaleString()}
            </text>
          );
        })}
        
        {/* X-axis labels */}
        <g fill="#6b7280" fontSize="12" textAnchor="middle">
          {data.map((d, i) => {
            const x = padding + i * ((width - 2 * padding) / data.length) + barWidth / 2;
            return (
              <text key={i} x={x} y={height - 10}>
                {d.label}
              </text>
            );
          })}
        </g>
        
        {/* Y-axis labels */}
        <g fill="#6b7280" fontSize="12" textAnchor="end">
          {[0, 1, 2, 3, 4].map(i => {
            const value = (i * maxValue) / 4;
            const y = height - padding - (i * (height - 2 * padding)) / 4;
            return (
              <text key={i} x={padding - 10} y={y + 4}>
                {value.toLocaleString()}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  className?: string;
  showLegend?: boolean;
}

export function DonutChart({ 
  data, 
  size = 200, 
  className = "",
  showLegend = true
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6;
  
  let cumulativePercentage = 0;
  
  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <div className="relative">
        <svg width={size} height={size}>
          {data.map((d, i) => {
            const percentage = (d.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            
            cumulativePercentage += percentage;
            
            return (
              <path
                key={i}
                d={createPath(startAngle, endAngle)}
                fill={d.color}
                className="hover:opacity-80 transition-opacity"
              />
            );
          })}
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">
            {total.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Total
          </div>
        </div>
      </div>
      
      {showLegend && (
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-sm">{d.label}</span>
              <span className="text-sm text-muted-foreground">
                ({((d.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Animated counter component
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ 
  end, 
  duration = 2000,
  prefix = "",
  suffix = "",
  className = ""
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
} 