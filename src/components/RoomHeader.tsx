import { useState, type ReactElement } from 'react';
import { ArrowLeft, Check, Copy, LogOut, Volume2, VolumeX } from 'lucide-react';
import type { ConnectionPhase, GameId } from '../shared/types';
import { isSoundMuted, setSoundMuted } from '../utils/sound';
import { BrandWordmark } from './BrandWordmark';

interface RoomHeaderProps {
  roomCode: string;
  phase: ConnectionPhase;
  activeGame: GameId | null;
  onBackToLounge: () => void;
  onLeaveRoom: () => void;
}

export function RoomHeader({
  roomCode,
  phase,
  activeGame,
  onBackToLounge,
  onLeaveRoom,
}: RoomHeaderProps): ReactElement {
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(() => isSoundMuted());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
  };

  const statusText =
    phase === 'connected'
      ? 'Together'
      : phase === 'waiting'
        ? 'Waiting'
        : phase === 'partner_disconnected'
          ? 'Partner away'
          : 'Reconnecting';

  return (
    <header className="glass-card sticky top-2 z-30 mx-auto flex w-full max-w-5xl items-center justify-between gap-2 rounded-2xl px-3.5 py-2 sm:gap-4 sm:px-6 sm:py-2.5">
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        {activeGame ? (
          <button
            type="button"
            onClick={onBackToLounge}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-[#5c3c4d] transition-colors hover:bg-[#fcecf1] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Games</span>
          </button>
        ) : (
          <BrandWordmark size="sm" />
        )}
      </div>

      <div
        className={`${
          activeGame ? 'flex' : 'hidden sm:flex'
        } items-center gap-2.5 text-xs sm:text-sm text-[#6f5061] min-w-0`}
      >
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy room code ${roomCode}`}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-2 py-1.5 font-semibold text-[#3b2230] transition-colors hover:bg-[#fcecf1] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="tabular-nums tracking-wider">{roomCode}</span>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-[#34855d]" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-[#8a687a]" aria-hidden="true" />
          )}
        </button>
        <span aria-hidden="true" className="hidden sm:inline text-[#cdb5c3]">
          ·
        </span>
        <span className="hidden sm:inline whitespace-nowrap font-medium">{statusText}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? 'Unmute gentle sounds' : 'Mute gentle sounds'}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#6f5061] transition-colors hover:bg-[#fcecf1] hover:text-[#3b2230] cursor-pointer"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onLeaveRoom}
          aria-label="Leave Room"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs sm:text-sm font-semibold text-[#9a3250] transition-colors hover:bg-[#fde9ef] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>
            Leave<span className="hidden sm:inline"> Room</span>
          </span>
        </button>
      </div>
    </header>
  );
}
