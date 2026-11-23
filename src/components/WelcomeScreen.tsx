import type { ReactElement } from 'react';
import { Heart, KeyRound, Sparkles } from 'lucide-react';
import { BrandWordmark } from './BrandWordmark';

interface WelcomeScreenProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export function WelcomeScreen({ onCreateClick, onJoinClick }: WelcomeScreenProps): ReactElement {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-between px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex w-full items-center justify-center">
        <BrandWordmark size="lg" />
      </div>

      <section className="glass-card-strong animate-pop-in my-8 w-full max-w-xl rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-12">
        <p className="text-sm font-medium tracking-wide text-[#8b5c72]">
          A Little World, Just for Two.
        </p>

        <h1 className="font-display mt-3 text-3xl leading-tight font-semibold text-[#3b2230] sm:text-5xl">
          Welcome to Our Little World
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6f5061] sm:text-lg">
          A private place for two hearts. Play cozy games, share sweet moments, and spend unhurried time together.
        </p>

        <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            data-start="true"
            onClick={onCreateClick}
            className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-[#d45279] px-7 py-3.5 text-base font-semibold text-white shadow-md shadow-[#d45279]/25 transition-all duration-150 hover:bg-[#be4067] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d45279] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
            <span>CREATE OUR ROOM</span>
          </button>

          <button
            type="button"
            onClick={onJoinClick}
            className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl border border-[#d6bdd3] bg-white/85 px-7 py-3.5 text-base font-semibold text-[#4c2e3f] shadow-xs transition-all duration-150 hover:bg-[#faf2f8] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8c6bc4] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <KeyRound className="h-5 w-5 text-[#8c6bc4]" aria-hidden="true" />
            <span>JOIN OUR ROOM</span>
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#7d5f70]">
          <Sparkles className="h-3.5 w-3.5 text-[#c080a1]" aria-hidden="true" />
          <span>No sign-up needed · Temporary private room · Just you and me</span>
        </div>
      </section>

      <footer className="text-center">
        <p className="font-display text-sm italic text-[#6f5061] sm:text-base">
          “Just two people. Countless little moments.”
        </p>
      </footer>
    </main>
  );
}
