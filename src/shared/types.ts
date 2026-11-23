export type AvatarId = 'heart' | 'moon' | 'star' | 'flower' | 'cloud' | 'sparkles';

export type PlayerSlot = 1 | 2;

export type GameId =
  | 'truth-or-dare'
  | 'tic-tac-toe'
  | 'spin-the-wheel'
  | 'know-me'
  | 'love-quiz'
  | 'memory-match'
  | 'never-have-i-ever'
  | 'would-you-rather'
  | 'guess-the-word'
  | 'couple-challenge';

export interface PlayerInfo {
  id: string;
  slot: PlayerSlot;
  nickname: string;
  avatar: AvatarId;
  connected: boolean;
  score: number;
}

export interface TruthOrDareState {
  turnSlot: PlayerSlot;
  choice: 'truth' | 'dare' | null;
  currentPrompt: {
    id: string;
    type: 'truth' | 'dare';
    category: string;
    text: string;
  } | null;
  usedPromptIds: string[];
  roundCount: number;
}

export type TicTacToeCell = 'X' | 'O' | null;

export interface TicTacToeState {
  board: TicTacToeCell[];
  turnSlot: PlayerSlot;
  winnerSlot: PlayerSlot | 'draw' | null;
  winningLine: number[] | null;
  scores: {
    p1: number;
    p2: number;
    draws: number;
  };
}

export interface SpinWheelState {
  spinning: boolean;
  spinId: number;
  rotationDeg: number;
  selectedIndex: number | null;
  selectedLabel: string | null;
  spunBySlot: PlayerSlot | null;
  turnSlot: PlayerSlot;
}

export interface KnowMeState {
  questionIndex: number;
  spotlightSlot: PlayerSlot;
  answers: {
    p1: string | null;
    p2: string | null;
  };
  revealed: boolean;
  awarded: boolean;
  scores: {
    p1: number;
    p2: number;
  };
}

export interface LoveQuizState {
  questionIndex: number;
  votes: {
    p1: PlayerSlot | null;
    p2: PlayerSlot | null;
  };
  revealed: boolean;
  matches: number;
  roundsPlayed: number;
}

export interface MemoryCard {
  id: number;
  symbol: string;
  label: string;
  flipped: boolean;
  matchedBy: PlayerSlot | null;
}

export interface MemoryMatchState {
  cards: MemoryCard[];
  flippedIndices: number[];
  turnSlot: PlayerSlot;
  moves: number;
  matchedPairs: {
    p1: number;
    p2: number;
  };
  pendingReset: boolean;
  completed: boolean;
}

export interface NeverHaveIEverState {
  promptIndex: number;
  usedIndices: number[];
  responses: {
    p1: 'have' | 'never' | null;
    p2: 'have' | 'never' | null;
  };
  revealed: boolean;
}

export interface WouldYouRatherState {
  promptIndex: number;
  usedIndices: number[];
  choices: {
    p1: 'A' | 'B' | null;
    p2: 'A' | 'B' | null;
  };
  revealed: boolean;
  matches: number;
}

export interface GuessTheWordState {
  setterSlot: PlayerSlot;
  category: string;
  secretWord: string;
  maskedWord: string;
  hint: string;
  hintRevealed: boolean;
  guessedLetters: string[];
  wrongLetters: string[];
  maxAttempts: number;
  phase: 'choosing' | 'guessing' | 'won' | 'lost';
  wordOptions: string[];
  roundsWon: number;
}

export interface CoupleChallengeState {
  challengeIndex: number;
  usedIndices: number[];
  completedCount: number;
  completedByRound: {
    p1: boolean;
    p2: boolean;
  };
}

export interface RoomGamesState {
  truthOrDare: TruthOrDareState;
  ticTacToe: TicTacToeState;
  spinWheel: SpinWheelState;
  knowMe: KnowMeState;
  loveQuiz: LoveQuizState;
  memoryMatch: MemoryMatchState;
  neverHaveIEver: NeverHaveIEverState;
  wouldYouRather: WouldYouRatherState;
  guessTheWord: GuessTheWordState;
  coupleChallenge: CoupleChallengeState;
}

export interface RoomSnapshot {
  code: string;
  players: PlayerInfo[];
  activeGame: GameId | null;
  justConnectedBanner: boolean;
  games: RoomGamesState;
}

export type ConnectionPhase =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'connected'
  | 'partner_disconnected'
  | 'connection_failed'
  | 'room_expired';

export interface ReactionEvent {
  id: string;
  emoji: string;
  fromSlot: PlayerSlot;
  fromNickname: string;
  kind: 'reaction' | 'love' | 'hug';
  createdAt: number;
}

export type ClientMessage =
  | {
      type: 'room:create';
      nickname: string;
      avatar: AvatarId;
    }
  | {
      type: 'room:join';
      code: string;
      nickname: string;
      avatar: AvatarId;
    }
  | {
      type: 'room:reconnect';
      code: string;
      playerId: string;
    }
  | {
      type: 'room:leave';
    }
  | {
      type: 'game:select';
      game: GameId | null;
    }
  | {
      type: 'reaction:send';
      emoji: string;
      kind: 'reaction' | 'love' | 'hug';
    }
  | {
      type: 'tod:pick';
      choice: 'truth' | 'dare';
    }
  | {
      type: 'tod:next';
      skip?: boolean;
    }
  | {
      type: 'ttt:move';
      index: number;
    }
  | {
      type: 'ttt:restart';
    }
  | {
      type: 'wheel:spin';
    }
  | {
      type: 'wheel:reset';
    }
  | {
      type: 'knowme:submit';
      answer: string;
    }
  | {
      type: 'knowme:award';
      point: boolean;
    }
  | {
      type: 'knowme:next';
    }
  | {
      type: 'lovequiz:vote';
      voteFor: PlayerSlot;
    }
  | {
      type: 'lovequiz:next';
    }
  | {
      type: 'memory:flip';
      index: number;
    }
  | {
      type: 'memory:restart';
    }
  | {
      type: 'nhie:respond';
      response: 'have' | 'never';
    }
  | {
      type: 'nhie:next';
    }
  | {
      type: 'wyr:choose';
      choice: 'A' | 'B';
    }
  | {
      type: 'wyr:next';
    }
  | {
      type: 'word:pick';
      word: string;
      hint: string;
    }
  | {
      type: 'word:guess';
      letter: string;
    }
  | {
      type: 'word:reveal_hint';
    }
  | {
      type: 'word:next';
    }
  | {
      type: 'challenge:complete';
    }
  | {
      type: 'challenge:next';
    };

export type ServerMessage =
  | {
      type: 'room:joined';
      playerId: string;
      slot: PlayerSlot;
      room: RoomSnapshot;
    }
  | {
      type: 'room:state';
      room: RoomSnapshot;
    }
  | {
      type: 'room:error';
      code: 'INVALID_CODE' | 'ROOM_FULL' | 'INVALID_NICKNAME' | 'ROOM_EXPIRED' | 'NOT_ALLOWED';
      message: string;
    }
  | {
      type: 'room:expired';
      message: string;
    }
  | {
      type: 'reaction:received';
      reaction: ReactionEvent;
    };
