import { useEffect, type ReactElement } from 'react';
import { RotateCcw } from 'lucide-react';
import type { ClientMessage, MemoryMatchState, PlayerInfo, PlayerSlot } from '../../shared/types';
import { playTapChime, playWinChime } from '../../utils/sound';

interface MemoryMatchGameProps {
  state: MemoryMatchState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

export function MemoryMatchGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: MemoryMatchGameProps): ReactElement {
  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);
  const isMyTurn = !state.completed && !state.pendingReset && state.turnSlot === mySlot;
  const activePlayer = players.find((p) => p.slot === state.turnSlot);

  useEffect(() => {
    if (state.completed) {
      playWinChime();
    }
  }, [state.completed]);

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Memory Match</h2>
          <p className="text-sm text-[#6f5061]">
            Moves: <span className="tabular-nums font-semibold">{state.moves}</span> ·{' '}
            {p1?.nickname ?? 'P1'}: <span className="tabular-nums font-semibold">{state.matchedPairs.p1}</span> ·{' '}
            {p2?.nickname ?? 'P2'}: <span className="tabular-nums font-semibold">{state.matchedPairs.p2}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] rounded-xl border border-[#e3cedb] bg-white/80 px-4 py-2 text-sm font-medium text-[#5c3c4d] hover:bg-white cursor-pointer"
        >
          Back to Lounge
        </button>
      </div>

      <div className="mt-5 text-center">
        {state.completed ? (
          <p className="font-display text-xl font-semibold text-[#b8365f]">
            All 6 pairs found in <span className="tabular-nums">{state.moves}</span> moves! ❤️
          </p>
        ) : (
          <p className="font-display text-lg font-medium text-[#3b2230]">
            {isMyTurn
              ? 'Your turn — flip two matching cards'
              : `Waiting for ${activePlayer?.nickname ?? `Player ${state.turnSlot}`}...`}
          </p>
        )}
      </div>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 sm:grid-cols-4">
        {state.cards.map((card, index) => {
          const isRevealed = card.flipped || card.matchedBy !== null;
          const canClick = isMyTurn && !isRevealed;
          return (
            <button
              key={card.id}
              type="button"
              aria-label={isRevealed ? `${card.label} card` : `Hidden card ${index + 1}`}
              disabled={!canClick}
              onClick={() => {
                playTapChime();
                onSend({ type: 'memory:flip', index });
              }}
              className={`flex aspect-square min-h-[76px] flex-col items-center justify-center rounded-2xl border text-3xl transition-all duration-200 ${
                card.matchedBy !== null
                  ? 'border-[#d45279]/40 bg-[#fde8ef] shadow-xs'
                  : card.flipped
                    ? 'border-[#8c6bc4]/50 bg-white shadow-sm'
                    : canClick
                      ? 'border-[#e4cddb] bg-gradient-to-br from-[#fff3f7] to-[#f2eafc] hover:-translate-y-0.5 hover:border-[#d45279] cursor-pointer'
                      : 'border-[#eadbe4] bg-[#faf4f7] cursor-default'
              }`}
            >
              {isRevealed ? (
                <span className="animate-pop-in" role="img" aria-label={card.label}>
                  {card.symbol}
                </span>
              ) : (
                <span className="text-lg text-[#c799b1]" aria-hidden="true">
                  ♥
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex justify-center">
        <button
          type="button"
          onClick={() => {
            playTapChime();
            onSend({ type: 'memory:restart' });
          }}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#be4067] cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>{state.completed ? 'Play Again' : 'Shuffle New Board'}</span>
        </button>
      </div>
    </section>
  );
}
