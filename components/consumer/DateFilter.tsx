"use client";

import { getDatesForWeek } from '@/lib/utils';

interface DateFilterProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function DateFilter({ selectedDate, onSelectDate }: DateFilterProps) {
  const dates = getDatesForWeek();

  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => onSelectDate('all')}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedDate === 'all'
            ? 'bg-[#609966] text-white'
            : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
        }`}
      >
        전체
      </button>
      {dates.map((date) => (
        <button
          key={date.value}
          onClick={() => onSelectDate(date.value)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedDate === date.value
              ? 'bg-[#609966] text-white'
              : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
          }`}
        >
          {date.label}
        </button>
      ))}
    </div>
  );
}
