'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[1001] bg-zinc-900 border-b-2 sm:border-b-4 border-yellow-400 px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-sm sm:text-xl font-black text-white tracking-tight flex items-center gap-1 sm:gap-2">
          <span className="text-base sm:text-xl">🌊</span>
          <span className="hidden xs:inline">ADUAN BANJIR MALANG</span>
          <span className="xs:hidden">BANJIR MLG</span>
        </h1>
        
        <div className="flex items-center gap-1.5 sm:gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-2 sm:px-4 py-1.5 sm:py-2 bg-yellow-400 text-black font-bold text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                Masuk
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="hidden sm:block px-4 py-2 bg-zinc-800 text-white font-bold text-sm border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Daftar
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 sm:w-10 sm:h-10 border-2 border-yellow-400'
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
