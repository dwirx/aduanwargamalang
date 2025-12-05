'use client';

import { useUser } from '@clerk/nextjs';
import { ReportType } from '../../lib/types';

interface ReportButtonProps {
  onReport: (type: ReportType) => void;
}

export function ReportButton({ onReport }: ReportButtonProps) {
  const { isSignedIn } = useUser();

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-2 sm:gap-3 w-[90%] sm:w-auto max-w-md">
      {/* Dry Route Button */}
      <button
        onClick={() => onReport('dry_route')}
        disabled={!isSignedIn}
        className={`
          px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-sm sm:text-lg border-2 sm:border-4 border-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
          hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[3px] sm:hover:translate-y-[3px]
          transition-all w-full
          ${isSignedIn
            ? 'bg-green-500 text-black cursor-pointer'
            : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
          }
        `}
      >
        ✅ <span className="hidden sm:inline">LAPOR </span>JALAN KERING
      </button>
      
      {/* Flood Report Button */}
      <button
        onClick={() => onReport('flood')}
        disabled={!isSignedIn}
        className={`
          px-6 sm:px-8 py-3 sm:py-4 font-black text-base sm:text-xl border-2 sm:border-4 border-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px]
          transition-all w-full
          ${isSignedIn
            ? 'bg-red-500 text-white cursor-pointer'
            : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
          }
        `}
      >
        🌊 LAPOR BANJIR
      </button>
      
      {!isSignedIn && (
        <p className="text-center text-yellow-400 text-xs sm:text-sm font-bold bg-zinc-900/90 px-2 py-1 rounded">
          Login untuk melapor
        </p>
      )}
    </div>
  );
}
