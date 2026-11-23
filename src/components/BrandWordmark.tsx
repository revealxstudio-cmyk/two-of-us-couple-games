import type { ReactElement } from 'react';
import { Heart } from 'lucide-react';

interface BrandWordmarkProps {
  size?: 'sm' | 'lg';
}

export function BrandWordmark({ size = 'sm' }: BrandWordmarkProps): ReactElement {
  const isLarge = size === 'lg';
  return (
    <span
      className={`font-display inline-flex items-center gap-2 font-semibold tracking-tight text-[#3b2230] whitespace-nowrap shrink-0 ${
        isLarge ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
      }`}
    >
      <span>TWO OF US</span>
      <Heart
        aria-hidden="true"
        className={`${isLarge ? 'h-6 w-6' : 'h-4 w-4'} fill-[#d45279] text-[#d45279]`}
      />
    </span>
  );
}
