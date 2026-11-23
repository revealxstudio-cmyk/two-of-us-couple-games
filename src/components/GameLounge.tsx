import type { ReactElement } from 'react';
import {
  Compass,
  Flame,
  Grid3X3,
  HeartHandshake,
  Layers,
  MessageCircleHeart,
  Play,
  Scale,
  Sparkles,
  SpellCheck,
  Trophy,
} from 'lucide-react';
import { GAME_CATALOG, type GameCatalogItem } from '../shared/gameData';
import type { GameId } from '../shared/types';

interface GameLoungeProps {
  isTogether: boolean;
  onSelectGame: (game: GameId) => void;
}

function renderGameIcon(iconName: GameCatalogItem['iconName'], accent: GameCatalogItem['accent']): ReactElement {
  const colorClasses =
    accent === 'rose'
      ? 'bg-[#fde5ed] text-[#c7426d]'
      : accent === 'lavender'
        ? 'bg-[#eee6fb] text-[#7351b2]'
        : 'bg-[#feebd9] text-[#bf6542]';

  const iconProps = { className: 'h-5 w-5', 'aria-hidden': true as const };

  let icon: ReactElement;
  switch (iconName) {
    case 'flame':
      icon = <Flame {...iconProps} />;
      break;
    case 'grid':
      icon = <Grid3X3 {...iconProps} />;
      break;
    case 'compass':
      icon = <Compass {...iconProps} />;
      break;
    case 'heart-handshake':
      icon = <HeartHandshake {...iconProps} />;
      break;
    case 'sparkles':
      icon = <Sparkles {...iconProps} />;
      break;
    case 'layers':
      icon = <Layers {...iconProps} />;
      break;
    case 'message-circle-heart':
      icon = <MessageCircleHeart {...iconProps} />;
      break;
    case 'scale':
      icon = <Scale {...iconProps} />;
      break;
    case 'spell-check':
      icon = <SpellCheck {...iconProps} />;
      break;
    case 'trophy':
      icon = <Trophy {...iconProps} />;
      break;
  }

  return (
    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${colorClasses}`}>
      {icon}
    </span>
  );
}

export function GameLounge({ isTogether, onSelectGame }: GameLoungeProps): ReactElement {
  return (
    <section aria-labelledby="lounge-heading" className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 id="lounge-heading" className="font-display text-2xl font-semibold text-[#3b2230] sm:text-3xl">
            Choose Our Little Game
          </h1>
          <p className="mt-1 text-sm text-[#6f5061]">
            What should we play together?
          </p>
        </div>
        {!isTogether && (
          <p className="text-xs font-medium text-[#8a5d72]">
            Waiting for your partner to join — you can preview any game below.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_CATALOG.map((game) => (
          <article
            key={game.id}
            className="glass-card flex flex-col justify-between rounded-3xl p-5 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                {renderGameIcon(game.iconName, game.accent)}
              </div>
              <h2 className="font-display mt-4 text-lg font-semibold text-[#3b2230]">
                {game.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6f5061]">
                {game.description}
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => onSelectGame(game.id)}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#fff0f4] px-4 py-2.5 text-sm font-semibold text-[#a52f55] transition-colors hover:bg-[#d45279] hover:text-white active:scale-[0.98] cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Play {game.title}</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
