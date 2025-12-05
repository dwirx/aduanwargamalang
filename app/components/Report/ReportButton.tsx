'use client';

import { useUser } from '@clerk/nextjs';
import { ReportType } from '../../lib/types';

interface ReportButtonProps {
  onReport: (type: ReportType) => void;
}

export function ReportButton({ onReport }: ReportButtonProps) {
  const { isSignedIn } = useUser();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-3">
      <button
        onClick={() => onReport('dry_route')}
        disabled={!isSignedIn}
        className={`
          px-6 py-3 font-bold text-lg border-4 border-black
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
          hover:translate-x-[3px] hover:translate-y-[3px]
          transition-all
          ${isSignedIn
            ? 'bg-green-500 text-black cursor-pointer'
            : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
          }
        `}
      >
        ✅ LAPOR JALAN KERING
      </button>
      
      <button
        onClick={() => onReport('flood')}
        disabled={!isSignedIn}
        className={`
          px-8 py-4 font-black text-xl border-4 border-black
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          hover:translate-x-[4px] hover:translate-y-[4px]
          transition-all
          ${isSignedIn
            ? 'bg-red-500 text-white cursor-pointer animate-pulse'
            : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
          }
        `}
      >
        🌊 LAPOR BANJIR
      </button>
      
      {!isSignedIn && (
        <p className="text-center text-yellow-400 text-sm font-bold bg-zinc-900/90 px-3 py-1 rounded">
          Login untuk melapor
        </p>
      )}
    </div>
  );
}
