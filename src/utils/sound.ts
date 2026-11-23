let audioCtx: AudioContext | null = null;
let muted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || muted) return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => undefined);
  }
  return audioCtx;
}

export function setSoundMuted(next: boolean): void {
  muted = next;
}

export function isSoundMuted(): boolean {
  return muted;
}

export function playSoftTone(freq = 523.25, durationSec = 0.14, gainLevel = 0.05): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainLevel, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSec + 0.02);
  } catch {
    // Ignore Web Audio errors in headless environments
  }
}

export function playWinChime(): void {
  playSoftTone(523.25, 0.14, 0.045);
  setTimeout(() => playSoftTone(659.25, 0.14, 0.045), 90);
  setTimeout(() => playSoftTone(783.99, 0.24, 0.05), 180);
}

export function playTapChime(): void {
  playSoftTone(587.33, 0.09, 0.035);
}
