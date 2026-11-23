import type { ReactElement } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { QUICK_REACTIONS } from '../shared/gameData';
import type { ReactionEvent } from '../shared/types';

interface InteractionsBarProps {
  reactions: ReactionEvent[];
  activeHug: ReactionEvent | null;
  onSendReaction: (emoji: string, kind: 'reaction' | 'love' | 'hug') => void;
}

export function InteractionsBar({
  reactions,
  activeHug,
  onSendReaction,
}: InteractionsBarProps): ReactElement {
  return (
    <>
      {/* Floating synced reactions */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-md justify-center"
      >
        {reactions.map((item, idx) => (
          <div
            key={item.id}
            style={{ marginLeft: `${((idx % 5) - 2) * 28}px` }}
            className="animate-float-up absolute flex items-center gap-1.5 rounded-2xl bg-white/92 px-3 py-1.5 text-sm font-medium text-[#3b2230] shadow-md border border-[#efd7e3]"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-xs text-[#6f5061]">{item.fromNickname}</span>
          </div>
        ))}
      </div>

      {/* Virtual Hug shared moment */}
      {activeHug && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-5"
        >
          <div className="glass-card-strong animate-pop-in flex max-w-sm flex-col items-center rounded-[2rem] px-8 py-7 text-center shadow-xl">
            <div className="animate-hug-pulse flex h-16 w-16 items-center justify-center rounded-full bg-[#fde2eb] text-[#d45279]">
              <Heart className="h-9 w-9 fill-current" aria-hidden="true" />
            </div>
            <p className="font-display mt-4 text-xl font-semibold text-[#3b2230]">
              Sending you the biggest hug ❤️
            </p>
            <p className="mt-1 text-sm text-[#6f5061]">From {activeHug.fromNickname}</p>
          </div>
        </div>
      )}

      {/* Interactive bar */}
      <section
        aria-label="Cute couple interactions"
        className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSendReaction('🤗', 'hug')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#fde7ef] px-4 py-2 text-sm font-semibold text-[#9a2e52] transition-all hover:bg-[#fad8e5] active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Virtual Hug</span>
          </button>

          <button
            type="button"
            onClick={() => onSendReaction('💖', 'love')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#efe7fb] px-4 py-2 text-sm font-semibold text-[#603fa0] transition-all hover:bg-[#e5d9f8] active:scale-95 cursor-pointer"
          >
            <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
            <span>Send Love</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Send ${emoji} reaction`}
              onClick={() => onSendReaction(emoji, 'reaction')}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-white/80 text-xl transition-transform hover:scale-110 hover:bg-white active:scale-95 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
