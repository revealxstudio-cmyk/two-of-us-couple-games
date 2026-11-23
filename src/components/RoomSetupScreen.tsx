import { useState, type FormEvent, type ReactElement } from 'react';
import { ArrowLeft, Heart, KeyRound, Loader2 } from 'lucide-react';
import { NICKNAME_SUGGESTIONS } from '../shared/gameData';
import { normalizeRoomCode } from '../shared/gameLogic';
import type { AvatarId } from '../shared/types';
import { AVATAR_OPTIONS, AvatarIcon } from './AvatarIcon';
import { BrandWordmark } from './BrandWordmark';

interface RoomSetupScreenProps {
  mode: 'create' | 'join';
  isConnecting: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onSwitchMode: (mode: 'create' | 'join') => void;
  onCreate: (nickname: string, avatar: AvatarId) => void;
  onJoin: (code: string, nickname: string, avatar: AvatarId) => void;
}

export function RoomSetupScreen({
  mode,
  isConnecting,
  errorMessage,
  onBack,
  onSwitchMode,
  onCreate,
  onJoin,
}: RoomSetupScreenProps): ReactElement {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<AvatarId>(mode === 'create' ? 'heart' : 'moon');
  const [roomCode, setRoomCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || errorMessage;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanedNick = nickname.trim();
    if (!cleanedNick) {
      setLocalError('Please enter a cute nickname before stepping inside.');
      return;
    }

    if (mode === 'create') {
      onCreate(cleanedNick, avatar);
      return;
    }

    const normalized = normalizeRoomCode(roomCode);
    if (normalized.length < 4) {
      setLocalError('Please enter the 6-character room code from your partner.');
      return;
    }
    onJoin(normalized, cleanedNick, avatar);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#5c3c4d] transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-[#d45279] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back</span>
        </button>

        <BrandWordmark size="sm" />
      </div>

      <section className="glass-card-strong animate-pop-in my-auto rounded-[2rem] p-6 sm:p-9">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-[#f7ebf2] p-1">
          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              onSwitchMode('create');
            }}
            className={`flex-1 min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              mode === 'create'
                ? 'bg-white text-[#3b2230] shadow-xs'
                : 'text-[#6f5061] hover:text-[#3b2230]'
            }`}
          >
            Create Our Room
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              onSwitchMode('join');
            }}
            className={`flex-1 min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              mode === 'join'
                ? 'bg-white text-[#3b2230] shadow-xs'
                : 'text-[#6f5061] hover:text-[#3b2230]'
            }`}
          >
            Join Our Room
          </button>
        </div>

        <header className="mt-6">
          <h1 className="font-display text-2xl font-semibold text-[#3b2230] sm:text-3xl">
            {mode === 'create' ? 'Open a Private Room' : 'Step Into Our Room'}
          </h1>
          <p className="mt-1.5 text-sm text-[#6f5061]">
            {mode === 'create'
              ? 'Choose a sweet nickname for this session, then share your code with your person.'
              : 'Enter your nickname and the room code your partner shared with you.'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
          {mode === 'join' && (
            <div>
              <label
                htmlFor="room-code-input"
                className="block text-sm font-semibold text-[#4c2e3f]"
              >
                Room Code
              </label>
              <input
                id="room-code-input"
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="e.g. H7K9P2"
                maxLength={6}
                value={roomCode}
                onChange={(e) => {
                  setLocalError(null);
                  setRoomCode(normalizeRoomCode(e.target.value));
                }}
                className="tabular-nums mt-2 w-full rounded-xl border border-[#dfc8d8] bg-white/90 px-4 py-3 text-center text-xl font-bold tracking-[0.28em] text-[#3b2230] placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder:text-[#a18697] focus:border-[#d45279] focus:outline-none focus:ring-2 focus:ring-[#d45279]/20"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="nickname-input"
              className="block text-sm font-semibold text-[#4c2e3f]"
            >
              Your Nickname
            </label>
            <input
              id="nickname-input"
              type="text"
              autoComplete="off"
              maxLength={20}
              placeholder="e.g. Sunshine, My Love, Moon..."
              value={nickname}
              onChange={(e) => {
                setLocalError(null);
                setNickname(e.target.value);
              }}
              className="mt-2 w-full rounded-xl border border-[#dfc8d8] bg-white/90 px-4 py-3 text-base text-[#3b2230] placeholder:text-[#a18697] focus:border-[#d45279] focus:outline-none focus:ring-2 focus:ring-[#d45279]/20"
            />
            <div className="mt-2.5 flex flex-wrap gap-2">
              {NICKNAME_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setLocalError(null);
                    setNickname(suggestion);
                  }}
                  className={`min-h-[36px] rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    nickname === suggestion
                      ? 'border-[#d45279] bg-[#fdeaf0] text-[#9f2c52]'
                      : 'border-[#e6d5e0] bg-white/75 text-[#684b5b] hover:bg-[#fbf1f5]'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-[#4c2e3f]">
              Choose Your Cute Icon
            </span>
            <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
              {AVATAR_OPTIONS.map((opt) => {
                const selected = avatar === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-label={`Choose ${opt.label} icon`}
                    aria-pressed={selected}
                    onClick={() => setAvatar(opt.id)}
                    className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border p-2 transition-all cursor-pointer ${
                      selected
                        ? 'border-[#d45279] bg-[#fff0f5] shadow-xs'
                        : 'border-[#eadbe5] bg-white/70 hover:bg-white'
                    }`}
                  >
                    <AvatarIcon avatar={opt.id} size="sm" />
                    <span className="text-[11px] font-medium text-[#5c3c4d]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {displayError && (
            <div
              role="alert"
              className="rounded-xl border border-[#e8a3b4] bg-[#fff0f3] px-4 py-3 text-sm font-medium text-[#992b49]"
            >
              {displayError}
            </div>
          )}

          <button
            type="submit"
            disabled={isConnecting}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#d45279] px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-[#d45279]/25 transition-all hover:bg-[#be4067] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Finding our connection... ❤️</span>
              </>
            ) : mode === 'create' ? (
              <>
                <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
                <span>Open Private Room</span>
              </>
            ) : (
              <>
                <KeyRound className="h-5 w-5" aria-hidden="true" />
                <span>Enter Our Room</span>
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
