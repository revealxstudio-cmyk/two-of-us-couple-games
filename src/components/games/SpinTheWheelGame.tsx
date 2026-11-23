import type { ReactElement } from 'react';
import { Compass, RotateCcw } from 'lucide-react';
import { WHEEL_SEGMENTS } from '../../shared/gameData';
import type { ClientMessage, PlayerInfo, SpinWheelState } from '../../shared/types';
import { playTapChime } from '../../utils/sound';

interface SpinTheWheelGameProps {
  state: SpinWheelState;
  players: PlayerInfo[];
  onSend: (msg: ClientMessage) => void;
  onBack: () => void;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function SpinTheWheelGame({
  state,
  players,
  onSend,
  onBack,
}: SpinTheWheelGameProps): ReactElement {
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const selectedSegment =
    state.selectedIndex !== null ? WHEEL_SEGMENTS[state.selectedIndex] : null;
  const spunByPlayer =
    state.spunBySlot !== null ? players.find((p) => p.slot === state.spunBySlot) : null;

  return (
    <section className="glass-card-strong animate-pop-in rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecd9e5] pb-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#3b2230]">Spin the Wheel</h2>
          <p className="text-sm text-[#6f5061]">
            Both of you watch the wheel spin and land together.
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

      <div className="mt-7 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        {/* Wheel */}
        <div className="relative mx-auto flex w-full max-w-[330px] flex-col items-center">
          {/* Top Pointer */}
          <div
            aria-hidden="true"
            className="z-10 -mb-3 h-6 w-6 rotate-45 rounded-tl-full rounded-tr-full rounded-bl-full bg-[#d45279] shadow-md ring-2 ring-white"
          />

          <div className="relative aspect-square w-full rounded-full p-2 bg-white/90 shadow-lg border border-[#edd5e2]">
            <svg
              viewBox="0 0 320 320"
              className="h-full w-full"
              style={{
                transform: `rotate(${state.rotationDeg}deg)`,
                transition: 'transform 2.6s cubic-bezier(0.15, 0.85, 0.25, 1)',
              }}
              aria-label="Romantic spin the wheel"
            >
              {WHEEL_SEGMENTS.map((seg, idx) => {
                const startAngle = idx * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                const midAngle = startAngle + segmentAngle / 2;
                return (
                  <g key={seg.label}>
                    <path
                      d={describeSlice(160, 160, 152, startAngle, endAngle)}
                      fill={seg.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x="160"
                      y="160"
                      fill={seg.textColor}
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor="end"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle - 90}, 160, 160) translate(138, 0)`}
                    >
                      {seg.label.length > 20 ? `${seg.label.slice(0, 18)}…` : seg.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="160" cy="160" r="24" fill="#ffffff" stroke="#e4c6d5" strokeWidth="3" />
              <circle cx="160" cy="160" r="8" fill="#d45279" />
            </svg>
          </div>
        </div>

        {/* Controls & Outcome */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {selectedSegment && !state.spinning ? (
            <div className="w-full rounded-3xl border border-[#eed6e2] bg-white/85 p-6 shadow-xs">
              <p className="text-xs font-semibold tracking-wide uppercase text-[#8a5d72]">
                {spunByPlayer ? `${spunByPlayer.nickname} spun` : 'Wheel result'}
              </p>
              <h3 className="font-display mt-2 text-2xl font-semibold text-[#3b2230]">
                {selectedSegment.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6f5061]">
                {selectedSegment.prompt}
              </p>
            </div>
          ) : (
            <div className="w-full rounded-3xl border border-dashed border-[#dfc4d3] bg-white/55 p-6">
              <p className="font-display text-xl font-medium text-[#3b2230]">
                {state.spinning ? 'Spinning for a sweet surprise...' : 'Ready to spin?'}
              </p>
              <p className="mt-1.5 text-sm text-[#6f5061]">
                Tap the button below and let fate choose your next cute moment.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={state.spinning}
              onClick={() => {
                playTapChime();
                onSend({ type: 'wheel:spin' });
              }}
              className="inline-flex min-h-[50px] items-center gap-2.5 rounded-2xl bg-[#d45279] px-7 py-3 text-base font-semibold text-white shadow-md shadow-[#d45279]/20 transition-all hover:bg-[#be4067] disabled:opacity-65 cursor-pointer"
            >
              <Compass className="h-5 w-5" aria-hidden="true" />
              <span>{state.spinning ? 'Spinning...' : state.selectedIndex !== null ? 'Spin Again' : 'Spin the Wheel'}</span>
            </button>

            {state.selectedIndex !== null && !state.spinning && (
              <button
                type="button"
                onClick={() => onSend({ type: 'wheel:reset' })}
                className="inline-flex min-h-[50px] items-center gap-2 rounded-2xl border border-[#dfc8d7] bg-white px-5 py-3 text-sm font-semibold text-[#5c3c4d] hover:bg-[#faf2f6] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Clear Result</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
