import type { ReactElement } from 'react';
import { ArrowRight, Heart, Lock } from 'lucide-react';
import { WOULD_YOU_RATHER_PROMPTS } from '../../shared/gameData';
import type { ClientMessage, PlayerInfo, PlayerSlot, WouldYouRatherState } from '../../shared/types';
import { playTapChime } from '../../utils/sound';

interface WouldYouRatherGameProps {
  state: WouldYouRatherState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

export function WouldYouRatherGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: WouldYouRatherGameProps): ReactElement {
  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);
  const myChoice = mySlot === 1 ? state.choices.p1 : state.choices.p2;
  const prompt = WOULD_YOU_RATHER_PROMPTS[state.promptIndex % WOULD_YOU_RATHER_PROMPTS.length];
  const matched = state.revealed && state.choices.p1 === state.choices.p2;

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Would You Rather?</h2>
          <p className="text-sm text-[#6f5061]">
            Heart matches so far: <span className="tabular-nums font-semibold">{state.matches}</span>
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

      <div className="mx-auto mt-7 max-w-2xl space-y-6">
        <p className="font-display text-center text-xl font-medium text-[#3b2230]">
          Which cozy option speaks to your heart?
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(['A', 'B'] as const).map((option) => {
            const text = option === 'A' ? prompt.a : prompt.b;
            const isMine = myChoice === option;
            const p1Picked = state.revealed && state.choices.p1 === option;
            const p2Picked = state.revealed && state.choices.p2 === option;

            return (
              <button
                key={option}
                type="button"
                disabled={Boolean(myChoice) || state.revealed}
                onClick={() => {
                  playTapChime();
                  onSend({ type: 'wyr:choose', choice: option });
                }}
                className={`flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-3xl border p-6 text-center transition-all ${
                  isMine && !state.revealed
                    ? 'border-[#d45279] bg-[#fff0f5] shadow-sm'
                    : state.revealed && (p1Picked || p2Picked)
                      ? 'border-[#8c6bc4] bg-[#f7f2fe]'
                      : !myChoice
                        ? 'border-[#e6d2df] bg-white/85 hover:-translate-y-0.5 hover:border-[#d45279] cursor-pointer'
                        : 'border-[#eadce4] bg-white/60 cursor-default'
                }`}
              >
                <span className="font-display text-xl font-semibold text-[#3b2230]">{text}</span>
                {state.revealed && (
                  <span className="text-xs font-medium text-[#6f5061]">
                    {[p1Picked ? p1?.nickname ?? 'Player 1' : null, p2Picked ? p2?.nickname ?? 'Player 2' : null]
                      .filter(Boolean)
                      .join(' & ') || 'Neither picked this'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!state.revealed && myChoice && (
          <div className="text-center text-sm text-[#6f5061]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#5c3c4d]">
              <Lock className="h-4 w-4 text-[#d45279]" aria-hidden="true" />
              <span>Choice locked! Waiting for your partner...</span>
            </span>
          </div>
        )}

        {state.revealed && (
          <div className="space-y-4 text-center">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#b8365f]">
              <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>
                {matched
                  ? 'You both picked the exact same thing!'
                  : 'Opposites attract! Talk about why you chose differently.'}
              </span>
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  playTapChime();
                  onSend({ type: 'wyr:next' });
                }}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#be4067] cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
