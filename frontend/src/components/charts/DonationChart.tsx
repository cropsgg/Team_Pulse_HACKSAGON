'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { BaseChart, chartColors, chartTheme, chartUtils } from './BaseChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';

interface DonationData {
  date: string;
  amount: number;
  count: number;
  average: number;
}

interface DonationChartProps {
  data: DonationData[];
  loading?: boolean;
  error?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  onPeriodChange?: (period: 'day' | 'week' | 'month' | 'year') => void;
  showAverage?: boolean;
  type?: 'line' | 'area' | 'bar';
  currency?: string;
  className?: string;
}

export function DonationChart({
  data,
  loading,
  error,
  period = 'month',
  onPeriodChange,
  showAverage = true,
  type = 'area',
  currency = 'USD',
  className,
}: DonationChartProps) {
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const averageDonation = totalCount > 0 ? totalAmount / totalCount : 0;

  // Calculate percentage change from previous period
  const currentPeriodTotal = data.slice(-7).reduce((sum, item) => sum + item.amount, 0);
  const previousPeriodTotal = data.slice(-14, -7).reduce((sum, item) => sum + item.amount, 0);
  const percentageChange = chartUtils.calculatePercentageChange(currentPeriodTotal, previousPeriodTotal);

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    switch (period) {
      case 'day':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'week':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short' });
      case 'year':
        return date.getFullYear().toString();
      default:
        return tickItem;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{formatXAxis(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.dataKey}:</span>
              <span className="font-medium">
                {entry.dataKey === 'amount' 
                  ? chartUtils.formatCurrency(entry.value, currency)
                  : chartUtils.formatNumber(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {onPeriodChange && (
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Button variant="outline" size="sm">
        <Calendar className="h-4 w-4 mr-2" />
        Filter
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              {...chartTheme.axis}
            />
            <YAxis 
              tickFormatter={(value) => chartUtils.formatCompactNumber(value)}
              {...chartTheme.axis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke={chartColors.primary}
              strokeWidth={2}
              dot={{ fill: chartColors.primary, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            {showAverage && (
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke={chartColors.secondary}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              {...chartTheme.axis}
            />
            <YAxis 
              tickFormatter={(value) => chartUtils.formatCompactNumber(value)}
              {...chartTheme.axis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke={chartColors.primary}
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              {...chartTheme.axis}
            />
            <YAxis 
              tickFormatter={(value) => chartUtils.formatCompactNumber(value)}
              {...chartTheme.axis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              fill={chartColors.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              {...chartTheme.axis}
            />
            <YAxis 
              tickFormatter={(value) => chartUtils.formatCompactNumber(value)}
              {...chartTheme.axis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke={chartColors.primary}
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        );
    }
  };

  return (
    <BaseChart
      title="Donation Trends"
      description={`Total donations: ${chartUtils.formatCurrency(totalAmount, currency)} • ${totalCount} donations`}
      value={chartUtils.formatCurrency(averageDonation, currency)}
      change={{
        value: Math.abs(percentageChange),
        type: chartUtils.getTrendType(percentageChange),
        period: 'vs last period',
      }}
      loading={loading}
      error={error}
      headerActions={headerActions}
      className={className}
      size="lg"
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </BaseChart>
  );
} 