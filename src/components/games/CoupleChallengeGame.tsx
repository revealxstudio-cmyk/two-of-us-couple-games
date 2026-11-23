import type { ReactElement } from 'react';
import { Check, Shuffle, Trophy } from 'lucide-react';
import { COUPLE_CHALLENGES } from '../../shared/gameData';
import type { ClientMessage, CoupleChallengeState, PlayerInfo, PlayerSlot } from '../../shared/types';
import { playTapChime, playWinChime } from '../../utils/sound';

interface CoupleChallengeGameProps {
  state: CoupleChallengeState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

export function CoupleChallengeGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: CoupleChallengeGameProps): ReactElement {
  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);
  const challenge = COUPLE_CHALLENGES[state.challengeIndex % COUPLE_CHALLENGES.length];
  const iCompleted = mySlot === 1 ? state.completedByRound.p1 : state.completedByRound.p2;
  const partnerCompleted = mySlot === 1 ? state.completedByRound.p2 : state.completedByRound.p1;
  const bothDone = state.completedByRound.p1 && state.completedByRound.p2;

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Couple Challenge</h2>
          <p className="text-sm text-[#6f5061]">
            Challenges completed together:{' '}
            <span className="tabular-nums font-semibold">{state.completedCount}</span>
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

      <div className="mx-auto mt-7 max-w-xl space-y-6 text-center">
        <div className="rounded-3xl border border-[#f2c8d7] bg-gradient-to-br from-[#fff5f8] to-[#feefe8] p-7 sm:p-9">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#d45279] shadow-xs">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="font-display mt-4 text-2xl leading-snug font-medium text-[#3b2230]">
            {challenge}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-[#ecd9e5] bg-white/80 p-3">
            <p className="truncate font-medium text-[#5c3c4d]">{p1?.nickname ?? 'Player 1'}</p>
            <p className="mt-1 text-xs text-[#7d5f70]">
              {state.completedByRound.p1 ? 'Done ❤️' : 'In progress'}
            </p>
          </div>
          <div className="rounded-2xl border border-[#ecd9e5] bg-white/80 p-3">
            <p className="truncate font-medium text-[#5c3c4d]">{p2?.nickname ?? 'Player 2'}</p>
            <p className="mt-1 text-xs text-[#7d5f70]">
              {state.completedByRound.p2 ? 'Done ❤️' : 'In progress'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {!iCompleted && (
            <button
              type="button"
              onClick={() => {
                if (partnerCompleted) playWinChime();
                else playTapChime();
                onSend({ type: 'challenge:complete' });
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#be4067] cursor-pointer"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              <span>Mark Completed</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playTapChime();
              onSend({ type: 'challenge:next' });
            }}
            className={`inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold cursor-pointer ${
              bothDone
                ? 'bg-[#8c6bc4] text-white hover:bg-[#7757b0]'
                : 'border border-[#dec8d7] bg-white text-[#5c3c4d] hover:bg-[#faf2f6]'
            }`}
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            <span>Random Challenge</span>
          </button>
        </div>
      </div>
    </section>
  );
}
