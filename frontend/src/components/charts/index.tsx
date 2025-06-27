'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  DollarSign,
  Users
} from 'lucide-react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  data: DataPoint[];
  title?: string;
  description?: string;
  height?: number;
  showValues?: boolean;
  animate?: boolean;
}

export const LineChart = ({ data, title, description, height = 200, animate = true }: ChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const pathData = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((maxValue - point.value) / range) * 80 + 10;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <Card className="p-6">
      {(title || description) && (
        <CardHeader className="px-0 pt-0">
          {title && <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-charity-500" />
            <span>{title}</span>
          </CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="px-0">
        <div className="relative" style={{ height }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid lines */}
            {[20, 40, 60, 80].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeWidth="0.5"
              />
            ))}
            
            {/* Area under the line */}
            <motion.path
              d={`${pathData} L 100 90 L 0 90 Z`}
              fill="url(#lineGradient)"
              initial={animate ? { opacity: 0 } : {}}
              animate={animate ? { opacity: 0.3 } : {}}
              transition={{ duration: 1, delay: 0.5 }}
            />
            
            {/* Line */}
            <motion.path
              d={pathData}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-charity-500"
              initial={animate ? { pathLength: 0 } : {}}
              animate={animate ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Data points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = ((maxValue - point.value) / range) * 80 + 10;
              return (
                <motion.circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="currentColor"
                  className="text-charity-500"
                  initial={animate ? { scale: 0 } : {}}
                  animate={animate ? { scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                />
              );
            })}
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" className="text-charity-500" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-charity-500" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Labels */}
        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
          {data.map((point, index) => (
            <span key={index}>{point.label}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const BarChart = ({ data, title, description, height = 200, showValues = true, animate = true }: ChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className="p-6">
      {(title || description) && (
        <CardHeader className="px-0 pt-0">
          {title && <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-impact-500" />
            <span>{title}</span>
          </CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="px-0">
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.label}</span>
                {showValues && (
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(item.value)}
                  </span>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: item.color || 'hsl(var(--charity-500))' }}
                  initial={animate ? { width: 0 } : { width: `${(item.value / maxValue) * 100}%` }}
                  animate={animate ? { width: `${(item.value / maxValue) * 100}%` } : {}}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const PieChart = ({ data, title, description, height = 200, showValues = true, animate = true }: ChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulatedPercentage = 0;

  const createSlicePath = (percentage: number, accumulatedPerc: number) => {
    const startAngle = accumulatedPerc * 2 * Math.PI;
    const endAngle = (accumulatedPerc + percentage) * 2 * Math.PI;
    
    const x1 = 50 + 40 * Math.cos(startAngle);
    const y1 = 50 + 40 * Math.sin(startAngle);
    const x2 = 50 + 40 * Math.cos(endAngle);
    const y2 = 50 + 40 * Math.sin(endAngle);
    
    const largeArc = percentage > 0.5 ? 1 : 0;
    
    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <Card className="p-6">
      {(title || description) && (
        <CardHeader className="px-0 pt-0">
          {title && <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-500" />
            <span>{title}</span>
          </CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="px-0">
        <div className="flex items-center gap-6">
          <div className="relative" style={{ width: height, height }}>
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {data.map((item, index) => {
                const percentage = item.value / total;
                const path = createSlicePath(percentage, accumulatedPercentage);
                accumulatedPercentage += percentage;
                
                return (
                  <motion.path
                    key={index}
                    d={path}
                    fill={item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                    initial={animate ? { opacity: 0, scale: 0 } : {}}
                    animate={animate ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                );
              })}
            </svg>
          </div>
          
          {showValues && (
            <div className="flex-1 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)` }}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {((item.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon = DollarSign,
  color = "text-blue-500",
  trend = "up"
}: {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ElementType;
  color?: string;
  trend?: "up" | "down" | "neutral";
}) => {
  const trendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Target;
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground";

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <motion.p 
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {typeof value === 'number' ? formatNumber(value) : value}
            </motion.p>
            {change && (
              <div className={`flex items-center space-x-1 text-sm ${trendColor}`}>
                {React.createElement(trendIcon, { className: "w-3 h-3" })}
                <span>{change}</span>
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export const DonutChart = ({ 
  data, 
  title, 
  centerText, 
  centerValue 
}: {
  data: DataPoint[];
  title?: string;
  centerText?: string;
  centerValue?: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulatedPercentage = 0;

  return (
    <Card className="p-6">
      {title && (
        <CardHeader className="px-0 pt-0">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="px-0">
        <div className="relative">
          <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const startAngle = accumulatedPercentage * 2 * Math.PI;
              const endAngle = (accumulatedPercentage + percentage) * 2 * Math.PI;
              
              const x1 = 50 + 35 * Math.cos(startAngle);
              const y1 = 50 + 35 * Math.sin(startAngle);
              const x2 = 50 + 35 * Math.cos(endAngle);
              const y2 = 50 + 35 * Math.sin(endAngle);
              
              const largeArc = percentage > 0.5 ? 1 : 0;
              const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
              
              accumulatedPercentage += percentage;
              
              return (
                <motion.path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              );
            })}
            
            {/* Center hole */}
            <circle cx="50" cy="50" r="20" fill="hsl(var(--background))" />
          </svg>
          
          {/* Center text */}
          {(centerText || centerValue) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {centerValue && (
                  <div className="text-2xl font-bold">{centerValue}</div>
                )}
                {centerText && (
                  <div className="text-xs text-muted-foreground">{centerText}</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`;
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Sample data for testing
export const sampleLineData: DataPoint[] = [
  { label: 'Jan', value: 12000 },
  { label: 'Feb', value: 19000 },
  { label: 'Mar', value: 15000 },
  { label: 'Apr', value: 25000 },
  { label: 'May', value: 22000 },
  { label: 'Jun', value: 30000 }
];

export const sampleBarData: DataPoint[] = [
  { label: 'Education', value: 45000, color: 'hsl(var(--blue-500))' },
  { label: 'Healthcare', value: 32000, color: 'hsl(var(--red-500))' },
  { label: 'Environment', value: 28000, color: 'hsl(var(--green-500))' },
  { label: 'Poverty', value: 15000, color: 'hsl(var(--yellow-500))' }
];

export const samplePieData: DataPoint[] = [
  { label: 'Donations', value: 65, color: 'hsl(var(--charity-500))' },
  { label: 'Grants', value: 25, color: 'hsl(var(--impact-500))' },
  { label: 'Sponsorships', value: 10, color: 'hsl(var(--primary))' }
]; 