'use client';

import { FilterType } from '../../lib/types';

interface QuickFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { type: FilterType; label: string; emoji: string }[] = [
  { type: 'all', label: 'Semua', emoji: '📍' },
  { type: 'passable', label: 'Bisa Lewat', emoji: '🚗' },
  { type: 'blocked', label: 'Lumpuh Total', emoji: '🚫' },
  { type: 'dry', label: 'Jalan Kering', emoji: '✅' },
];

export function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
  return (
    <div className="fixed top-20 left-4 z-[1000] flex flex-col gap-2">
      {filters.map((filter) => (
        <button
          key={filter.type}
          onClick={() => onFilterChange(filter.type)}
          className={`
            px-3 py-2 font-bold text-sm border-2 border-black
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
            hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
            hover:translate-x-[2px] hover:translate-y-[2px]
            transition-all whitespace-nowrap
            ${activeFilter === filter.type
              ? 'bg-yellow-400 text-black'
              : 'bg-zinc-800 text-white'
            }
          `}
        >
          {filter.emoji} {filter.label}
        </button>
      ))}
    </div>
  );
}
