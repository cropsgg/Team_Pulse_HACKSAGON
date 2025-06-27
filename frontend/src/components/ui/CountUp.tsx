'use client';

import React from 'react';
import { useCountUp } from '@/hooks/useCountdown';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ 
  end, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  className = ''
}) => {
  const count = useCountUp({ end, duration });

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}; 