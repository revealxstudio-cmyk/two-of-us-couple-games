import { useState, type FormEvent, type ReactElement } from 'react';
import { ArrowRight, HelpCircle, SpellCheck } from 'lucide-react';
import type { ClientMessage, GuessTheWordState, PlayerInfo, PlayerSlot } from '../../shared/types';
import { playTapChime, playWinChime } from '../../utils/sound';

interface GuessTheWordGameProps {
  state: GuessTheWordState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function GuessTheWordGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: GuessTheWordGameProps): ReactElement {
  const [customWord, setCustomWord] = useState('');
  const [customHint, setCustomHint] = useState('');

  const setterPlayer = players.find((p) => p.slot === state.setterSlot);
  const guesserSlot: PlayerSlot = state.setterSlot === 1 ? 2 : 1;
  const guesserPlayer = players.find((p) => p.slot === guesserSlot);
  const isSetter = mySlot === state.setterSlot;

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = customWord.toUpperCase().replace(/[^A-Z]/g, '');
    if (cleaned.length < 3) return;
    playTapChime();
    onSend({ type: 'word:pick', word: cleaned, hint: customHint });
    setCustomWord('');
    setCustomHint('');
  };

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Guess the Word</h2>
          <p className="text-sm text-[#6f5061]">
            Category: {state.category} · Words solved:{' '}
            <span className="tabular-nums font-semibold">{state.roundsWon}</span>
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

      {state.phase === 'choosing' && (
        <div className="mx-auto mt-7 max-w-xl space-y-6">
          {isSetter ? (
            <>
              <div className="text-center">
                <p className="font-display text-xl font-medium text-[#3b2230]">
                  Pick a secret word for {guesserPlayer?.nickname ?? 'your partner'}
                </p>
                <p className="mt-1 text-sm text-[#6f5061]">
                  Tap a quick cozy word or write your own below.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {state.wordOptions.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => {
                      playTapChime();
                      onSend({ type: 'word:pick', word, hint: '' });
                    }}
                    className="min-h-[48px] rounded-2xl border border-[#ebd3df] bg-[#fff2f6] px-5 py-2.5 text-sm font-bold tracking-wider text-[#9e2c52] hover:bg-[#fde3ec] cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-3 rounded-2xl border border-[#eadbe5] bg-white/80 p-5">
                <label htmlFor="custom-word" className="block text-sm font-semibold text-[#4c2e3f]">
                  Or write your own secret word (letters only, 3–14 chars)
                </label>
                <input
                  id="custom-word"
                  type="text"
                  maxLength={14}
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                  placeholder="e.g. STARLIGHT"
                  className="w-full rounded-xl border border-[#dfc8d8] bg-white px-4 py-2.5 text-base uppercase tracking-wider text-[#3b2230]"
                />
                <input
                  type="text"
                  maxLength={80}
                  value={customHint}
                  onChange={(e) => setCustomHint(e.target.value)}
                  placeholder="Optional clue (e.g. Our late-night walk)"
                  className="w-full rounded-xl border border-[#dfc8d8] bg-white px-4 py-2.5 text-sm text-[#3b2230]"
                />
                <button
                  type="submit"
                  disabled={customWord.trim().length < 3}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#d45279] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#be4067] disabled:opacity-55 cursor-pointer"
                >
                  <SpellCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Set Secret Word</span>
                </button>
              </form>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#dfc4d3] bg-white/70 p-8 text-center">
              <p className="font-display text-xl font-medium text-[#3b2230]">
                {setterPlayer?.nickname ?? 'Your partner'} is choosing a secret word...
              </p>
              <p className="mt-2 text-sm text-[#6f5061]">Get ready to guess letter by letter!</p>
            </div>
          )}
        </div>
      )}

      {state.phase !== 'choosing' && (
        <div className="mx-auto mt-7 max-w-xl space-y-6 text-center">
          <div className="rounded-3xl border border-[#edd5e1] bg-white/85 p-6">
            <p className="text-xs font-medium text-[#6f5061]">
              {isSetter
                ? `Your secret word (${state.secretWord})`
                : `${setterPlayer?.nickname ?? 'Partner'}'s secret word`}
            </p>
            <p className="tabular-nums mt-3 text-3xl font-bold tracking-[0.28em] text-[#3b2230] sm:text-4xl">
              {state.phase === 'guessing' ? state.maskedWord : state.secretWord.split('').join(' ')}
            </p>
            <p className="mt-3 text-sm text-[#6f5061]">
              Mistakes:{' '}
              <span className="tabular-nums font-semibold">
                {state.wrongLetters.length} / {state.maxAttempts}
              </span>
            </p>

            {state.hintRevealed && (
              <p className="mt-3 rounded-xl bg-[#f8f2fe] px-4 py-2 text-sm font-medium text-[#5c438b]">
                Hint: {state.hint}
              </p>
            )}
          </div>

          {state.phase === 'guessing' && (
            <>
              {!isSetter && !state.hintRevealed && (
                <button
                  type="button"
                  onClick={() => onSend({ type: 'word:reveal_hint' })}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#dcd0ee] bg-white px-4 py-2 text-xs font-semibold text-[#60419a] hover:bg-[#f7f2fe] cursor-pointer"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Need a hint?</span>
                </button>
              )}

              <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-9">
                {ALPHABET.map((letter) => {
                  const isCorrect = state.guessedLetters.includes(letter);
                  const isWrong = state.wrongLetters.includes(letter);
                  const disabled = isSetter || isCorrect || isWrong;
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        playTapChime();
                        onSend({ type: 'word:guess', letter });
                      }}
                      className={`min-h-[44px] rounded-xl border text-sm font-bold transition-colors ${
                        isCorrect
                          ? 'border-[#8bc9a8] bg-[#e9f7ef] text-[#286846]'
                          : isWrong
                            ? 'border-[#e8c6cf] bg-[#fceef2] text-[#a77382] line-through'
                            : !isSetter
                              ? 'border-[#e3cedb] bg-white text-[#3b2230] hover:border-[#d45279] hover:bg-[#fff3f7] cursor-pointer'
                              : 'border-[#eadbe4] bg-white/60 text-[#7d5f70] cursor-default'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {(state.phase === 'won' || state.phase === 'lost') && (
            <div className="space-y-4">
              <p
                onMouseEnter={() => {
                  if (state.phase === 'won') playWinChime();
                }}
                className="font-display text-xl font-semibold text-[#b8365f]"
              >
                {state.phase === 'won'
                  ? `You got it! The word was ${state.secretWord} ❤️`
                  : `So close! The word was ${state.secretWord}.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  playTapChime();
                  onSend({ type: 'word:next' });
                }}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#be4067] cursor-pointer"
              >
                <span>Swap Roles & Play Next</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
