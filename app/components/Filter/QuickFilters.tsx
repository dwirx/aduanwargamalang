'use client';

import { useState } from 'react';
import { FilterType } from '../../lib/types';

interface QuickFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { type: FilterType; label: string; shortLabel: string; emoji: string }[] = [
  { type: 'all', label: 'Semua', shortLabel: 'All', emoji: '📍' },
  { type: 'passable', label: 'Bisa Lewat', shortLabel: 'Lewat', emoji: '🚗' },
  { type: 'blocked', label: 'Lumpuh Total', shortLabel: 'Block', emoji: '🚫' },
  { type: 'dry', label: 'Jalan Kering', shortLabel: 'Kering', emoji: '✅' },
];

export function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeFilterData = filters.find(f => f.type === activeFilter);

  return (
    <>
      {/* Mobile: Horizontal compact bar at bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-zinc-900/95 border-t-2 border-zinc-700 backdrop-blur-sm">
        <div className="flex">
          {filters.map((filter) => (
            <button
              key={filter.type}
              onClick={() => onFilterChange(filter.type)}
              className={`flex-1 py-3 px-1 font-bold text-[10px] text-center transition-all border-r border-zinc-700 last:border-r-0 ${
                activeFilter === filter.type
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="text-base block mb-0.5">{filter.emoji}</span>
              {filter.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Vertical buttons on left */}
      <div className="hidden sm:flex fixed top-[72px] left-4 z-[1000] flex-col gap-1.5">
        {filters.map((filter) => (
          <button
            key={filter.type}
            onClick={() => onFilterChange(filter.type)}
            className={`
              px-3 py-2 font-bold text-xs border-2 border-black
              shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
              hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-[2px] hover:translate-y-[2px]
              transition-all whitespace-nowrap
              ${activeFilter === filter.type
                ? 'bg-yellow-400 text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }
            `}
          >
            {filter.emoji} {filter.label}
          </button>
        ))}
      </div>
    </>
  );
}
