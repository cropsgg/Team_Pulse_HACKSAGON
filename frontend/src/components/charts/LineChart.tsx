import React from 'react';

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
  className?: string;
}

export function LineChart({ 
  data, 
  height = 250, 
  color = '#ef4444', 
  className 
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const width = 400;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate SVG path
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <div className={className}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Chart line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              className="hover:r-6 transition-all duration-200"
            />
          );
        })}
        
        {/* X-axis labels */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          return (
            <text
              key={index}
              x={x}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {point.label}
            </text>
          );
        })}
        
        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, index) => {
          const value = minValue + ratio * range;
          const y = padding + chartHeight - ratio * chartHeight;
          return (
            <text
              key={index}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              ₹{(value / 1000).toFixed(0)}K
            </text>
          );
        })}
      </svg>
    </div>
  );
} 