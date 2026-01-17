'use client';

import React from 'react';
import { Clock, Calendar, CalendarDays } from 'lucide-react';
import type { TimeGranularity } from '@/types/analytics';

interface TimeGranularitySelectorProps {
  value: TimeGranularity;
  onChange: (value: TimeGranularity) => void;
  className?: string;
}

const granularityOptions: Array<{
  value: TimeGranularity;
  label: string;
  icon: React.ElementType;
}> = [
  { value: 'hourly', label: 'Hourly', icon: Clock },
  { value: 'daily', label: 'Daily', icon: Calendar },
  { value: 'monthly', label: 'Monthly', icon: CalendarDays },
];

export function TimeGranularitySelector({
  value,
  onChange,
  className = '',
}: TimeGranularitySelectorProps) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-white p-1 ${className}`}>
      {granularityOptions.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium
              transition-colors duration-200
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TimeGranularitySelector;
