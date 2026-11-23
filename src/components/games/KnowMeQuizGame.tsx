import { useState, type FormEvent, type ReactElement } from 'react';
import { ArrowRight, Check, HeartHandshake, Lock } from 'lucide-react';
import { KNOW_ME_QUESTIONS } from '../../shared/gameData';
import type { ClientMessage, KnowMeState, PlayerInfo, PlayerSlot } from '../../shared/types';
import { playTapChime, playWinChime } from '../../utils/sound';

interface KnowMeQuizGameProps {
  state: KnowMeState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

export function KnowMeQuizGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: KnowMeQuizGameProps): ReactElement {
  const [draft, setDraft] = useState('');
  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);
  const spotlightPlayer = players.find((p) => p.slot === state.spotlightSlot);
  const guesserSlot: PlayerSlot = state.spotlightSlot === 1 ? 2 : 1;
  const guesserPlayer = players.find((p) => p.slot === guesserSlot);

  const isSpotlight = mySlot === state.spotlightSlot;
  const myAnswer = mySlot === 1 ? state.answers.p1 : state.answers.p2;
  const partnerAnswer = mySlot === 1 ? state.answers.p2 : state.answers.p1;
  const question = KNOW_ME_QUESTIONS[state.questionIndex % KNOW_ME_QUESTIONS.length];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    playTapChime();
    onSend({ type: 'knowme:submit', answer: draft.trim() });
    setDraft('');
  };

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">
            How Well Do You Know Me?
          </h2>
          <p className="text-sm text-[#6f5061]">
            {p1?.nickname ?? 'Player 1'}: <span className="tabular-nums font-semibold">{state.scores.p1}</span> ·{' '}
            {p2?.nickname ?? 'Player 2'}: <span className="tabular-nums font-semibold">{state.scores.p2}</span>
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
        <div className="rounded-3xl border border-[#f0cbd9] bg-gradient-to-br from-[#fff5f8] to-[#fdebf1] p-6 text-center">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#8b556b]">
            About {spotlightPlayer?.nickname ?? `Player ${state.spotlightSlot}`}
          </p>
          <p className="font-display mt-3 text-2xl font-medium text-[#3b2230]">{question}</p>
        </div>

        {!state.revealed ? (
          myAnswer ? (
            <div className="rounded-2xl border border-[#e6d4df] bg-white/85 p-5 text-center">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c3c4d]">
                <Lock className="h-4 w-4 text-[#d45279]" aria-hidden="true" />
                <span>Your answer is locked in!</span>
              </div>
              <p className="mt-2 text-sm text-[#6f5061]">
                {partnerAnswer
                  ? 'Revealing both answers...'
                  : `Waiting for ${isSpotlight ? guesserPlayer?.nickname ?? 'your partner' : spotlightPlayer?.nickname ?? 'your partner'} to submit...`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor="knowme-input" className="block text-sm font-semibold text-[#4c2e3f]">
                {isSpotlight
                  ? 'Write your real answer (kept secret until both submit)'
                  : `Guess ${spotlightPlayer?.nickname ?? 'your partner'}'s answer`}
              </label>
              <input
                id="knowme-input"
                type="text"
                maxLength={120}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your answer..."
                className="w-full rounded-xl border border-[#dfc8d8] bg-white px-4 py-3 text-base text-[#3b2230] focus:border-[#d45279] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#d45279] px-5 py-3 text-sm font-semibold text-white hover:bg-[#be4067] disabled:opacity-55 cursor-pointer"
              >
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                <span>Lock In Answer</span>
              </button>
            </form>
          )
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#edd5e1] bg-white/90 p-5">
                <p className="text-xs font-semibold text-[#8a5d72]">
                  {spotlightPlayer?.nickname ?? 'Spotlight'}’s real answer
                </p>
                <p className="mt-2 text-lg font-semibold text-[#3b2230]">
                  {state.spotlightSlot === 1 ? state.answers.p1 : state.answers.p2}
                </p>
              </div>
              <div className="rounded-2xl border border-[#dcd1ef] bg-white/90 p-5">
                <p className="text-xs font-semibold text-[#6b5496]">
                  {guesserPlayer?.nickname ?? 'Partner'}’s guess
                </p>
                <p className="mt-2 text-lg font-semibold text-[#3b2230]">
                  {guesserSlot === 1 ? state.answers.p1 : state.answers.p2}
                </p>
              </div>
            </div>

            {!state.awarded && isSpotlight ? (
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playWinChime();
                    onSend({ type: 'knowme:award', point: true });
                  }}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#be4067] cursor-pointer"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Spot on! (+1 to {guesserPlayer?.nickname ?? 'Partner'})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSend({ type: 'knowme:award', point: false })}
                  className="min-h-[48px] rounded-2xl border border-[#dfc8d7] bg-white px-5 py-2.5 text-sm font-semibold text-[#5c3c4d] hover:bg-[#faf2f6] cursor-pointer"
                >
                  Nice try! (No point)
                </button>
              </div>
            ) : !state.awarded ? (
              <p className="text-center text-sm text-[#6f5061]">
                Waiting for {spotlightPlayer?.nickname ?? 'your partner'} to score your guess...
              </p>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    playTapChime();
                    onSend({ type: 'knowme:next' });
                  }}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#8c6bc4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7757b0] cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
