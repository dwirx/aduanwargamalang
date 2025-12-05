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
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-zinc-900 border-b-4 border-yellow-400 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-xl font-black text-white tracking-tight">
          🌊 ADUAN BANJIR MALANG
        </h1>
        
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-yellow-400 text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Masuk
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-zinc-800 text-white font-bold border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Daftar
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10 border-2 border-yellow-400'
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
