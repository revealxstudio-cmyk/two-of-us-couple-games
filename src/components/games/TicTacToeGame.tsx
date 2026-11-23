import { useEffect, type ReactElement } from 'react';
import { RotateCcw } from 'lucide-react';
import type { ClientMessage, PlayerInfo, PlayerSlot, TicTacToeState } from '../../shared/types';
import { playTapChime, playWinChime } from '../../utils/sound';

interface TicTacToeGameProps {
  state: TicTacToeState;
  players: PlayerInfo[];
  mySlot: PlayerSlot;
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

export function TicTacToeGame({
  state,
  players,
  mySlot,
  onSend,
  onBack,
}: TicTacToeGameProps): ReactElement {
  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);
  const mySymbol = mySlot === 1 ? 'X' : 'O';
  const isMyTurn = state.winnerSlot === null && state.turnSlot === mySlot;

  useEffect(() => {
    if (state.winnerSlot === 1 || state.winnerSlot === 2) {
      playWinChime();
    }
  }, [state.winnerSlot]);

  const winnerPlayer =
    state.winnerSlot === 1 ? p1 : state.winnerSlot === 2 ? p2 : null;

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Tic-Tac-Toe</h2>
          <p className="text-sm text-[#6f5061]">
            You are playing as <span className="font-bold">{mySymbol}</span>
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

      {/* Score Strip */}
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div
          className={`rounded-2xl border p-3 ${
            state.turnSlot === 1 && !state.winnerSlot
              ? 'border-[#d45279] bg-[#fff1f5]'
              : 'border-[#eddbe5] bg-white/75'
          }`}
        >
          <p className="truncate text-xs font-medium text-[#6f5061]">
            {p1?.nickname ?? 'Player 1'} (X)
          </p>
          <p className="tabular-nums mt-0.5 text-xl font-bold text-[#c23b64]">{state.scores.p1}</p>
        </div>
        <div className="rounded-2xl border border-[#eddbe5] bg-white/75 p-3">
          <p className="text-xs font-medium text-[#6f5061]">Draws</p>
          <p className="tabular-nums mt-0.5 text-xl font-bold text-[#5c3c4d]">{state.scores.draws}</p>
        </div>
        <div
          className={`rounded-2xl border p-3 ${
            state.turnSlot === 2 && !state.winnerSlot
              ? 'border-[#8c6bc4] bg-[#f5f0fd]'
              : 'border-[#eddbe5] bg-white/75'
          }`}
        >
          <p className="truncate text-xs font-medium text-[#6f5061]">
            {p2?.nickname ?? 'Player 2'} (O)
          </p>
          <p className="tabular-nums mt-0.5 text-xl font-bold text-[#7351b2]">{state.scores.p2}</p>
        </div>
      </div>

      {/* Turn / Outcome Banner */}
      <div className="mt-5 text-center">
        {state.winnerSlot === null ? (
          <p className="font-display text-lg font-medium text-[#3b2230]">
            {isMyTurn
              ? `Your turn (${mySymbol}) — pick a square`
              : `Waiting for ${state.turnSlot === 1 ? p1?.nickname ?? 'Player 1' : p2?.nickname ?? 'Player 2'}...`}
          </p>
        ) : state.winnerSlot === 'draw' ? (
          <p className="font-display text-xl font-semibold text-[#5c3c4d]">
            It’s a cozy tie! Equally matched hearts.
          </p>
        ) : (
          <p className="font-display text-xl font-semibold text-[#b8365f]">
            {winnerPlayer?.nickname ?? `Player ${state.winnerSlot}`} wins this round! ❤️
          </p>
        )}
      </div>

      {/* 3x3 Board */}
      <div
        role="grid"
        aria-label="Tic-Tac-Toe board"
        className="mx-auto mt-6 grid max-w-[320px] grid-cols-3 gap-3"
      >
        {state.board.map((cell, index) => {
          const isWinningCell = state.winningLine?.includes(index) ?? false;
          const canTap = isMyTurn && cell === null;
          return (
            <button
              key={index}
              type="button"
              aria-label={`Square ${index + 1}${cell ? `, ${cell}` : ', empty'}`}
              disabled={!canTap}
              onClick={() => {
                playTapChime();
                onSend({ type: 'ttt:move', index });
              }}
              className={`flex aspect-square min-h-[84px] items-center justify-center rounded-2xl border text-4xl font-bold transition-all duration-150 ${
                isWinningCell
                  ? 'border-[#d45279] bg-[#fde3ec] scale-[1.03] shadow-md'
                  : cell !== null
                    ? 'border-[#e8d5e1] bg-white/95'
                    : canTap
                      ? 'border-[#e6d1de] bg-white/80 hover:border-[#d45279] hover:bg-[#fff6f9] active:scale-95 cursor-pointer'
                      : 'border-[#eddde7] bg-white/60 cursor-default'
              }`}
            >
              {cell === 'X' && (
                <span className="animate-pop-in font-display text-[#d45279]">X</span>
              )}
              {cell === 'O' && (
                <span className="animate-pop-in font-display text-[#8c6bc4]">O</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex justify-center">
        <button
          type="button"
          onClick={() => {
            playTapChime();
            onSend({ type: 'ttt:restart' });
          }}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#d45279] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#be4067] cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>{state.winnerSlot ? 'Play Again' : 'Restart Board'}</span>
        </button>
      </div>
    </section>
  );
}
