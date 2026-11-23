import type { ReactElement } from 'react';
import { Cloud, Flower2, Heart, Moon, Sparkles, Star } from 'lucide-react';
import type { AvatarId } from '../shared/types';

export const AVATAR_OPTIONS: { id: AvatarId; label: string; bg: string; fg: string }[] = [
  { id: 'heart', label: 'Heart', bg: 'bg-[#fde2eb]', fg: 'text-[#c9416c]' },
  { id: 'moon', label: 'Moon', bg: 'bg-[#ebe3fa]', fg: 'text-[#7553b3]' },
  { id: 'star', label: 'Star', bg: 'bg-[#feebd9]', fg: 'text-[#be6744]' },
  { id: 'flower', label: 'Flower', bg: 'bg-[#fce6ef]', fg: 'text-[#bf4b7a]' },
  { id: 'cloud', label: 'Cloud', bg: 'bg-[#e9effd]', fg: 'text-[#5a74b8]' },
  { id: 'sparkles', label: 'Sparkles', bg: 'bg-[#f4e6fc]', fg: 'text-[#9152b8]' },
];

interface AvatarIconProps {
  avatar: AvatarId;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarIcon({ avatar, size = 'md' }: AvatarIconProps): ReactElement {
  const option = AVATAR_OPTIONS.find((item) => item.id === avatar) ?? AVATAR_OPTIONS[0];
  const wrapperSize =
    size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';

  const renderIcon = () => {
    switch (avatar) {
      case 'moon':
        return <Moon className={iconSize} />;
      case 'star':
        return <Star className={iconSize} />;
      case 'flower':
        return <Flower2 className={iconSize} />;
      case 'cloud':
        return <Cloud className={iconSize} />;
      case 'sparkles':
        return <Sparkles className={iconSize} />;
      case 'heart':
      default:
        return <Heart className={`${iconSize} fill-current`} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${wrapperSize} ${option.bg} ${option.fg} shrink-0 shadow-xs`}
      aria-hidden="true"
    >
      {renderIcon()}
    </span>
  );
}
