import type { ReactElement } from 'react';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { LOVE_QUIZ_QUESTIONS } from '../../shared/gameData';
import type { ClientMessage, LoveQuizState, PlayerInfo, PlayerSlot } from '../../shared/types';
import { playTapChime } from '../../utils/sound';
import { AvatarIcon } from '../AvatarIcon';

interface LoveQuizGameProps {
  state: LoveQuizState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

export function LoveQuizGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: LoveQuizGameProps): ReactElement {
  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);
  const myVote = mySlot === 1 ? state.votes.p1 : state.votes.p2;
  const question = LOVE_QUIZ_QUESTIONS[state.questionIndex % LOVE_QUIZ_QUESTIONS.length];
  const matched = state.revealed && state.votes.p1 === state.votes.p2;

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Our Love Quiz</h2>
          <p className="text-sm text-[#6f5061]">
            Matched answers: <span className="tabular-nums font-semibold">{state.matches}</span> /{' '}
            <span className="tabular-nums">{state.roundsPlayed}</span>
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

      <div className="mx-auto mt-7 max-w-xl space-y-6">
        <div className="rounded-3xl border border-[#ddd0f3] bg-gradient-to-br from-[#faf6ff] to-[#efe7fb] p-6 text-center">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#6e529d]">
            Question <span className="tabular-nums">{state.questionIndex + 1}</span>
          </p>
          <p className="font-display mt-3 text-2xl font-medium text-[#3b2230]">{question}</p>
        </div>

        {!state.revealed ? (
          myVote ? (
            <div className="rounded-2xl border border-[#e6d4df] bg-white/85 p-5 text-center">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c3c4d]">
                <Lock className="h-4 w-4 text-[#8c6bc4]" aria-hidden="true" />
                <span>Your vote is locked in!</span>
              </div>
              <p className="mt-1.5 text-sm text-[#6f5061]">
                Waiting for your partner to cast their vote...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2].map((slotNum) => {
                const slot = slotNum as PlayerSlot;
                const player = slot === 1 ? p1 : p2;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      playTapChime();
                      onSend({ type: 'lovequiz:vote', voteFor: slot });
                    }}
                    className="flex min-h-[84px] items-center justify-center gap-3 rounded-2xl border border-[#e3cedb] bg-white/85 px-5 py-4 text-base font-semibold text-[#3b2230] transition-all hover:border-[#8c6bc4] hover:bg-[#f8f3fe] active:scale-[0.98] cursor-pointer"
                  >
                    <AvatarIcon avatar={player?.avatar ?? (slot === 1 ? 'heart' : 'moon')} size="sm" />
                    <span>{player?.nickname ?? `Player ${slot}`}</span>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-5 text-center">
            <div className="rounded-2xl border border-[#edd5e1] bg-white/90 p-5">
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#d45279]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>
                  {matched
                    ? 'You both agreed completely! Two minds, one heart.'
                    : 'A cute little disagreement! Compare your stories.'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#fff4f7] p-3">
                  <p className="text-xs text-[#6f5061]">{p1?.nickname ?? 'Player 1'} voted</p>
                  <p className="mt-1 font-semibold text-[#3b2230]">
                    {state.votes.p1 === 1 ? p1?.nickname ?? 'Player 1' : p2?.nickname ?? 'Player 2'}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f7f2fe] p-3">
                  <p className="text-xs text-[#6f5061]">{p2?.nickname ?? 'Player 2'} voted</p>
                  <p className="mt-1 font-semibold text-[#3b2230]">
                    {state.votes.p2 === 1 ? p1?.nickname ?? 'Player 1' : p2?.nickname ?? 'Player 2'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTapChime();
                onSend({ type: 'lovequiz:next' });
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#be4067] cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
