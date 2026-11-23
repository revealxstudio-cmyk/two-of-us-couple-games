import { useState, type ReactElement } from 'react';
import { Check, Copy, Heart, Loader2, WifiOff } from 'lucide-react';
import type { ConnectionPhase, PlayerInfo, PlayerSlot } from '../shared/types';
import { AvatarIcon } from './AvatarIcon';

interface WaitingBannerProps {
  roomCode: string;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  phase: ConnectionPhase;
  justConnectedBanner: boolean;
}

export function WaitingBanner({
  roomCode,
  players,
  mySlot,
  phase,
  justConnectedBanner,
}: WaitingBannerProps): ReactElement {
  const [copied, setCopied] = useState(false);

  const player1 = players.find((p) => p.slot === 1) ?? null;
  const player2 = players.find((p) => p.slot === 2) ?? null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="glass-card rounded-3xl p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center">
        {/* Player 1 & Player 2 Presence */}
        <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-5">
          {[1, 2].map((slotNum) => {
            const player = slotNum === 1 ? player1 : player2;
            const isMe = slotNum === mySlot;

            if (!player) {
              return (
                <div
                  key={slotNum}
                  className="flex flex-1 items-center gap-3 rounded-2xl border border-dashed border-[#dbb8ca] bg-white/50 px-3.5 py-3 sm:flex-initial sm:min-w-[168px]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f8ecf2] text-[#a57b90]">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#6f5061]">Waiting...</p>
                    <p className="text-xs text-[#907182]">Partner slot</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={player.id}
                className="flex flex-1 items-center gap-3 rounded-2xl border border-[#ecd9e5] bg-white/80 px-3.5 py-3 sm:flex-initial sm:min-w-[168px]"
              >
                <AvatarIcon avatar={player.avatar} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#3b2230]">
                    {player.nickname}
                  </p>
                  <p className="text-xs text-[#6f5061]">
                    {isMe ? 'You' : 'Partner'} ·{' '}
                    {player.connected ? 'Connected' : 'Offline'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Message & Code Sharing */}
        <div className="flex flex-col items-start justify-between gap-3 sm:items-end sm:text-right">
          {phase === 'waiting' && (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-[#5c3c4d]">
                <Heart className="h-4 w-4 fill-[#d45279] text-[#d45279]" aria-hidden="true" />
                <span>Your person is on their way... ❤️</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs text-[#6f5061]">Share code:</span>
                <span className="tabular-nums rounded-xl bg-[#fff0f4] px-3 py-1.5 text-base font-bold tracking-[0.2em] text-[#9c2a4f]">
                  {roomCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#d45279] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#be4067] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {phase === 'connected' && (
            <div className="space-y-1">
              <p className="font-display text-lg font-semibold text-[#3b2230]">
                {justConnectedBanner ? "Yay! You're together now!" : 'Just you and me'}
              </p>
              <p className="text-xs text-[#6f5061]">
                Both hearts are connected live in room {roomCode}
              </p>
            </div>
          )}

          {phase === 'partner_disconnected' && (
            <div className="flex items-center gap-2 text-sm font-medium text-[#92435c]">
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Waiting for your other half to reconnect...</span>
            </div>
          )}

          {phase === 'connection_failed' && (
            <div className="flex items-center gap-2 text-sm font-medium text-[#92435c]">
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Oops! Our connection was interrupted. Reconnecting...</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
