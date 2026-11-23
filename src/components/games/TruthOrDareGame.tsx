import type { ReactElement } from 'react';
import { Flame, Heart, RotateCcw, SkipForward } from 'lucide-react';
import type { ClientMessage, PlayerInfo, PlayerSlot, TruthOrDareState } from '../../shared/types';
import { playTapChime } from '../../utils/sound';

interface TruthOrDareGameProps {
  state: TruthOrDareState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

export function TruthOrDareGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: TruthOrDareGameProps): ReactElement {
  const currentPlayer = players.find((p) => p.slot === state.turnSlot);
  const nextSlot: PlayerSlot = state.turnSlot === 1 ? 2 : 1;
  const nextPlayer = players.find((p) => p.slot === nextSlot);
  const isMyTurn = state.turnSlot === mySlot;

  const handlePick = (choice: 'truth' | 'dare') => {
    playTapChime();
    onSend({ type: 'tod:pick', choice });
  };

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Truth or Dare</h2>
          <p className="text-sm text-[#6f5061]">
            Round <span className="tabular-nums font-semibold">{state.roundCount + 1}</span> ·{' '}
            {currentPlayer ? `${currentPlayer.nickname}'s turn` : `Player ${state.turnSlot}'s turn`}
            {nextPlayer ? ` · Next: ${nextPlayer.nickname}` : ''}
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

      {!state.currentPrompt ? (
        <div className="mt-7 space-y-6">
          <div className="text-center">
            <p className="font-display text-xl font-medium text-[#3b2230]">
              {isMyTurn
                ? 'Choose your card for this round'
                : `Waiting for ${currentPlayer?.nickname ?? 'your partner'} to choose...`}
            </p>
            <p className="mt-1 text-sm text-[#6f5061]">
              {isMyTurn
                ? 'Pick a heartfelt Truth or a sweet, harmless Dare.'
                : 'You will both see the selected card right here.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              disabled={!isMyTurn}
              onClick={() => handlePick('truth')}
              className="flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-3xl border border-[#f2c4d4] bg-gradient-to-br from-[#fff3f7] to-[#fde4ec] p-6 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#d45279] shadow-xs">
                <Heart className="h-6 w-6 fill-current" aria-hidden="true" />
              </span>
              <span className="font-display text-2xl font-semibold text-[#4c2233]">Truth</span>
              <span className="text-sm text-[#764b5d]">Sweet honesty & cute secrets</span>
            </button>

            <button
              type="button"
              disabled={!isMyTurn}
              onClick={() => handlePick('dare')}
              className="flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-3xl border border-[#d9c8f0] bg-gradient-to-br from-[#f8f4fe] to-[#ede3fa] p-6 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7e58bf] shadow-xs">
                <Flame className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="font-display text-2xl font-semibold text-[#36224e]">Dare</span>
              <span className="text-sm text-[#5d4b76]">Playful, gentle challenges</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-7 space-y-6 text-center">
          <div
            className={`mx-auto max-w-xl rounded-[2rem] border p-7 sm:p-9 shadow-sm ${
              state.currentPrompt.type === 'truth'
                ? 'border-[#f1c4d3] bg-gradient-to-br from-[#fff5f8] to-[#fde8ef]'
                : 'border-[#d8c7ef] bg-gradient-to-br from-[#faf6ff] to-[#efe7fb]'
            }`}
          >
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7a5769]">
              {state.currentPrompt.type === 'truth' ? 'Truth' : 'Dare'} · {state.currentPrompt.category}
            </p>
            <p className="font-display mt-4 text-2xl leading-snug font-medium text-[#3b2230] sm:text-3xl">
              {state.currentPrompt.text}
            </p>
            <p className="mt-5 text-xs text-[#6f5061]">
              For {currentPlayer?.nickname ?? `Player ${state.turnSlot}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                playTapChime();
                onSend({ type: 'tod:next', skip: true });
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-[#dec8d7] bg-white px-5 py-2.5 text-sm font-semibold text-[#5c3c4d] hover:bg-[#faf2f6] cursor-pointer"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              <span>Skip</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapChime();
                onSend({ type: 'tod:next', skip: false });
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#be4067] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Next Challenge</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
