import type { ReactElement } from 'react';

export function Backdrop(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 14% 16%, rgba(250, 198, 218, 0.78) 0%, transparent 46%), radial-gradient(circle at 86% 20%, rgba(217, 198, 248, 0.74) 0%, transparent 45%), radial-gradient(circle at 72% 84%, rgba(253, 214, 192, 0.75) 0%, transparent 48%), linear-gradient(160deg, #FFF8F6 0%, #FCECF2 52%, #F3EBFB 100%)',
      }}
    >
      {/* Crescent moon */}
      <svg
        viewBox="0 0 80 80"
        className="animate-float-slow absolute top-10 right-8 h-14 w-14 text-[#dec0e0] opacity-90 sm:top-14 sm:right-16 sm:h-20 sm:w-20"
        fill="none"
      >
        <path
          d="M52 14C37.5 16.2 27 29.5 29.2 44.2C31.2 57.5 42.3 67.2 55.6 67.6C44.5 72.1 31.2 68.5 23.1 58.6C13.7 47.1 14.8 30 25.6 20C33.1 13 43.3 10.9 52 14Z"
          fill="currentColor"
        />
      </svg>

      {/* Soft pastel clouds */}
      <svg
        viewBox="0 0 180 70"
        className="animate-drift-cloud absolute top-20 left-4 h-12 w-32 text-white/75 sm:left-14 sm:h-16 sm:w-44"
        fill="currentColor"
      >
        <path d="M36 58h104c14 0 24-9 24-21 0-11-9-20-20-21-4-10-14-16-26-16-14 0-25 9-28 21-3-2-7-3-11-3-11 0-20 8-22 18-11 1-21 9-21 20 0 1 0 2 0 2z" />
      </svg>

      <svg
        viewBox="0 0 180 70"
        className="animate-drift-cloud absolute bottom-16 right-4 h-12 w-36 text-white/65 sm:right-20 sm:h-16 sm:w-48"
        style={{ animationDelay: '3s' }}
        fill="currentColor"
      >
        <path d="M36 58h104c14 0 24-9 24-21 0-11-9-20-20-21-4-10-14-16-26-16-14 0-25 9-28 21-3-2-7-3-11-3-11 0-20 8-22 18-11 1-21 9-21 20 0 1 0 2 0 2z" />
      </svg>

      {/* Subtle twinkling stars */}
      <span
        className="animate-twinkle absolute top-[18%] left-[24%] text-sm text-[#cfa8e8]"
        style={{ animationDelay: '0.4s' }}
      >
        ✦
      </span>
      <span
        className="animate-twinkle absolute top-[32%] right-[24%] text-xs text-[#e8a3bc]"
        style={{ animationDelay: '1.6s' }}
      >
        ✦
      </span>
      <span
        className="animate-twinkle absolute bottom-[26%] left-[14%] text-sm text-[#e7b29c]"
        style={{ animationDelay: '2.2s' }}
      >
        ✦
      </span>
      <span
        className="animate-twinkle absolute bottom-[18%] left-[44%] text-xs text-[#cfa8e8]"
        style={{ animationDelay: '1.1s' }}
      >
        ✦
      </span>

      {/* Gentle floating pastel hearts */}
      <svg
        viewBox="0 0 24 24"
        className="animate-float-slow absolute top-[44%] left-[7%] h-5 w-5 text-[#f0b4c8]/55"
        style={{ animationDelay: '1.2s' }}
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="animate-float-slow absolute top-[58%] right-[8%] h-6 w-6 text-[#d5c1f0]/55"
        style={{ animationDelay: '2.7s' }}
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
}
