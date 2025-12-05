'use client';

import { FilterType } from '../../lib/types';

interface QuickFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { type: FilterType; label: string; shortLabel: string; emoji: string; color: string }[] = [
  { type: 'all', label: 'Semua', shortLabel: 'All', emoji: '📍', color: 'bg-zinc-600' },
  { type: 'passable', label: 'Bisa Lewat', shortLabel: 'Lewat', emoji: '🟡', color: 'bg-yellow-500' },
  { type: 'blocked', label: 'Lumpuh Total', shortLabel: 'Block', emoji: '🔴', color: 'bg-red-500' },
  { type: 'dry', label: 'Jalan Kering', shortLabel: 'Kering', emoji: '🟢', color: 'bg-green-500' },
];

export function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
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

      {/* Desktop: Horizontal bar below header */}
      <div className="hidden sm:flex fixed top-[64px] left-1/2 -translate-x-1/2 z-[1001] gap-1">
        {filters.map((filter) => (
          <button
            key={filter.type}
            onClick={() => onFilterChange(filter.type)}
            className={`
              px-3 py-1.5 font-bold text-xs border-2 border-black
              shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-[1px] hover:translate-y-[1px]
              transition-all whitespace-nowrap flex items-center gap-1.5
              ${activeFilter === filter.type
                ? 'bg-yellow-400 text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }
            `}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${filter.color}`}></span>
            {filter.label}
          </button>
        ))}
      </div>
    </>
  );
}
