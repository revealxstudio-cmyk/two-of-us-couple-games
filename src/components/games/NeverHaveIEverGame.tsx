import type { ReactElement } from 'react';
import { ArrowRight, CheckCircle2, Lock, XCircle } from 'lucide-react';
import { NEVER_HAVE_I_EVER_PROMPTS } from '../../shared/gameData';
import type { ClientMessage, NeverHaveIEverState, PlayerInfo, PlayerSlot } from '../../shared/types';
import { playTapChime } from '../../utils/sound';

interface NeverHaveIEverGameProps {
  state: NeverHaveIEverState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

export function NeverHaveIEverGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: NeverHaveIEverGameProps): ReactElement {
  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);
  const myResponse = mySlot === 1 ? state.responses.p1 : state.responses.p2;
  const prompt = NEVER_HAVE_I_EVER_PROMPTS[state.promptIndex % NEVER_HAVE_I_EVER_PROMPTS.length];

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Never Have I Ever</h2>
          <p className="text-sm text-[#6f5061]">Be honest—both answers reveal together.</p>
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
        <div className="rounded-3xl border border-[#f2c8d7] bg-gradient-to-br from-[#fff5f8] to-[#fdebf1] p-7">
          <p className="font-display text-2xl leading-snug font-medium text-[#3b2230]">{prompt}</p>
        </div>

        {!state.revealed ? (
          myResponse ? (
            <div className="rounded-2xl border border-[#e6d4df] bg-white/85 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c3c4d]">
                <Lock className="h-4 w-4 text-[#d45279]" aria-hidden="true" />
                <span>Your confession is locked in!</span>
              </div>
              <p className="mt-1.5 text-sm text-[#6f5061]">
                Waiting for your partner to tap their answer...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  playTapChime();
                  onSend({ type: 'nhie:respond', response: 'have' });
                }}
                className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border border-[#f0bed0] bg-[#fff0f5] px-5 py-3 text-base font-semibold text-[#a52d54] hover:bg-[#fde2ec] cursor-pointer"
              >
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <span>I Have</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapChime();
                  onSend({ type: 'nhie:respond', response: 'never' });
                }}
                className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border border-[#d6c6ee] bg-[#f7f2fe] px-5 py-3 text-base font-semibold text-[#60419a] hover:bg-[#ede3fb] cursor-pointer"
              >
                <XCircle className="h-5 w-5" aria-hidden="true" />
                <span>Never!</span>
              </button>
            </div>
          )
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-[#edd5e1] bg-white/90 p-4">
                <p className="text-xs text-[#6f5061]">{p1?.nickname ?? 'Player 1'}</p>
                <p className="mt-1 text-lg font-semibold text-[#3b2230]">
                  {state.responses.p1 === 'have' ? 'Guilty! I have' : 'Never ever'}
                </p>
              </div>
              <div className="rounded-2xl border border-[#dcd1ef] bg-white/90 p-4">
                <p className="text-xs text-[#6f5061]">{p2?.nickname ?? 'Player 2'}</p>
                <p className="mt-1 text-lg font-semibold text-[#3b2230]">
                  {state.responses.p2 === 'have' ? 'Guilty! I have' : 'Never ever'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTapChime();
                onSend({ type: 'nhie:next' });
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#be4067] cursor-pointer"
            >
              <span>Next Prompt</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
