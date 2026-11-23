import {
  COUPLE_CHALLENGES,
  DARE_PROMPTS,
  KNOW_ME_QUESTIONS,
  LOVE_QUIZ_QUESTIONS,
  MEMORY_SYMBOLS,
  NEVER_HAVE_I_EVER_PROMPTS,
  TRUTH_PROMPTS,
  WHEEL_SEGMENTS,
  WORD_CATEGORIES,
  WOULD_YOU_RATHER_PROMPTS,
} from './gameData.ts';
import type {
  CoupleChallengeState,
  GuessTheWordState,
  KnowMeState,
  LoveQuizState,
  MemoryCard,
  MemoryMatchState,
  NeverHaveIEverState,
  PlayerSlot,
  RoomGamesState,
  SpinWheelState,
  TicTacToeCell,
  TicTacToeState,
  TruthOrDareState,
  WouldYouRatherState,
} from './types.ts';

export function normalizeRoomCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function validateNickname(raw: string): { ok: true; nickname: string } | { ok: false; error: string } {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (trimmed.length === 0) {
    return { ok: false, error: 'Please enter a cute nickname first.' };
  }
  if (trimmed.length > 20) {
    return { ok: false, error: 'Please keep nicknames under 20 characters.' };
  }
  return { ok: true, nickname: trimmed };
}

export function generateRoomCode(existingCodes: Set<string>): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 50; attempt += 1) {
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  return `LUV${Math.floor(100 + Math.random() * 900)}`;
}

export function createInitialTruthOrDare(): TruthOrDareState {
  return {
    turnSlot: 1,
    choice: null,
    currentPrompt: null,
    usedPromptIds: [],
    roundCount: 0,
  };
}

export function pickTruthOrDarePrompt(
  state: TruthOrDareState,
  choice: 'truth' | 'dare',
  rng: () => number = Math.random,
): TruthOrDareState {
  const pool = choice === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS;
  const unused = pool.filter((item) => !state.usedPromptIds.includes(item.id));
  const candidates = unused.length > 0 ? unused : pool.filter((item) => item.id !== state.currentPrompt?.id);
  const finalPool = candidates.length > 0 ? candidates : pool;
  const chosen = finalPool[Math.floor(rng() * finalPool.length)];
  const resetIds = unused.length === 0 ? [chosen.id] : [...state.usedPromptIds, chosen.id];

  return {
    ...state,
    choice,
    currentPrompt: chosen,
    usedPromptIds: resetIds,
    roundCount: state.roundCount + 1,
  };
}

export function advanceTruthOrDareTurn(state: TruthOrDareState, skip = false): TruthOrDareState {
  const nextTurn: PlayerSlot = skip ? state.turnSlot : state.turnSlot === 1 ? 2 : 1;
  return {
    ...state,
    turnSlot: nextTurn,
    choice: null,
    currentPrompt: null,
  };
}

export function createInitialTicTacToe(): TicTacToeState {
  return {
    board: Array<TicTacToeCell>(9).fill(null),
    turnSlot: 1,
    winnerSlot: null,
    winningLine: null,
    scores: { p1: 0, p2: 0, draws: 0 },
  };
}

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function evaluateTicTacToe(board: TicTacToeCell[]): {
  winnerSymbol: 'X' | 'O' | 'draw' | null;
  winningLine: number[] | null;
} {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winnerSymbol: board[a], winningLine: line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winnerSymbol: 'draw', winningLine: null };
  }
  return { winnerSymbol: null, winningLine: null };
}

export function applyTicTacToeMove(
  state: TicTacToeState,
  playerSlot: PlayerSlot,
  index: number,
): TicTacToeState {
  if (state.winnerSlot !== null) return state;
  if (playerSlot !== state.turnSlot) return state;
  if (index < 0 || index > 8) return state;
  if (state.board[index] !== null) return state;

  const symbol: 'X' | 'O' = playerSlot === 1 ? 'X' : 'O';
  const nextBoard = [...state.board];
  nextBoard[index] = symbol;

  const evaluation = evaluateTicTacToe(nextBoard);
  if (evaluation.winnerSymbol === 'X' || evaluation.winnerSymbol === 'O') {
    const winnerSlot: PlayerSlot = evaluation.winnerSymbol === 'X' ? 1 : 2;
    return {
      ...state,
      board: nextBoard,
      winnerSlot,
      winningLine: evaluation.winningLine,
      scores: {
        ...state.scores,
        p1: winnerSlot === 1 ? state.scores.p1 + 1 : state.scores.p1,
        p2: winnerSlot === 2 ? state.scores.p2 + 1 : state.scores.p2,
      },
    };
  }

  if (evaluation.winnerSymbol === 'draw') {
    return {
      ...state,
      board: nextBoard,
      winnerSlot: 'draw',
      winningLine: null,
      scores: {
        ...state.scores,
        draws: state.scores.draws + 1,
      },
    };
  }

  return {
    ...state,
    board: nextBoard,
    turnSlot: playerSlot === 1 ? 2 : 1,
  };
}

export function restartTicTacToe(state: TicTacToeState): TicTacToeState {
  return {
    board: Array<TicTacToeCell>(9).fill(null),
    turnSlot: state.turnSlot === 1 ? 2 : 1,
    winnerSlot: null,
    winningLine: null,
    scores: state.scores,
  };
}

export function createInitialSpinWheel(): SpinWheelState {
  return {
    spinning: false,
    spinId: 0,
    rotationDeg: 0,
    selectedIndex: null,
    selectedLabel: null,
    spunBySlot: null,
    turnSlot: 1,
  };
}

export function spinWheelState(
  state: SpinWheelState,
  playerSlot: PlayerSlot,
  rng: () => number = Math.random,
): SpinWheelState {
  const segmentCount = WHEEL_SEGMENTS.length;
  const segmentAngle = 360 / segmentCount;
  const selectedIndex = Math.floor(rng() * segmentCount);
  // Wheel pointer is at top (0deg). Segment i spans [i * segAngle, (i+1) * segAngle] clockwise from top.
  // To land segment i center under top pointer (0deg), wheel rotation mod 360 should equal 360 - (i + 0.5) * segAngle.
  const targetCenter = (selectedIndex + 0.5) * segmentAngle;
  const desiredMod = (360 - targetCenter + 360) % 360;
  const currentMod = state.rotationDeg % 360;
  const deltaToTarget = (desiredMod - currentMod + 360) % 360;
  const extraSpins = (4 + Math.floor(rng() * 3)) * 360;
  const nextRotation = state.rotationDeg + extraSpins + deltaToTarget;

  return {
    spinning: true,
    spinId: state.spinId + 1,
    rotationDeg: nextRotation,
    selectedIndex,
    selectedLabel: WHEEL_SEGMENTS[selectedIndex].label,
    spunBySlot: playerSlot,
    turnSlot: playerSlot === 1 ? 2 : 1,
  };
}

export function createInitialKnowMe(): KnowMeState {
  return {
    questionIndex: 0,
    spotlightSlot: 1,
    answers: { p1: null, p2: null },
    revealed: false,
    awarded: false,
    scores: { p1: 0, p2: 0 },
  };
}

export function submitKnowMeAnswer(
  state: KnowMeState,
  playerSlot: PlayerSlot,
  answer: string,
): KnowMeState {
  const cleaned = answer.trim().slice(0, 120);
  if (!cleaned || state.revealed) return state;
  const nextAnswers = {
    ...state.answers,
    [playerSlot === 1 ? 'p1' : 'p2']: cleaned,
  };
  const bothAnswered = Boolean(nextAnswers.p1 && nextAnswers.p2);
  return {
    ...state,
    answers: nextAnswers,
    revealed: bothAnswered,
  };
}

export function awardKnowMePoint(state: KnowMeState, point: boolean): KnowMeState {
  if (!state.revealed || state.awarded) return state;
  const guesserSlot: PlayerSlot = state.spotlightSlot === 1 ? 2 : 1;
  return {
    ...state,
    awarded: true,
    scores: point
      ? {
          p1: guesserSlot === 1 ? state.scores.p1 + 1 : state.scores.p1,
          p2: guesserSlot === 2 ? state.scores.p2 + 1 : state.scores.p2,
        }
      : state.scores,
  };
}

export function nextKnowMeRound(state: KnowMeState): KnowMeState {
  return {
    ...state,
    questionIndex: (state.questionIndex + 1) % KNOW_ME_QUESTIONS.length,
    spotlightSlot: state.spotlightSlot === 1 ? 2 : 1,
    answers: { p1: null, p2: null },
    revealed: false,
    awarded: false,
  };
}

export function createInitialLoveQuiz(): LoveQuizState {
  return {
    questionIndex: 0,
    votes: { p1: null, p2: null },
    revealed: false,
    matches: 0,
    roundsPlayed: 0,
  };
}

export function submitLoveQuizVote(
  state: LoveQuizState,
  playerSlot: PlayerSlot,
  voteFor: PlayerSlot,
): LoveQuizState {
  if (state.revealed) return state;
  const nextVotes = {
    ...state.votes,
    [playerSlot === 1 ? 'p1' : 'p2']: voteFor,
  };
  const bothVoted = nextVotes.p1 !== null && nextVotes.p2 !== null;
  const matched = bothVoted && nextVotes.p1 === nextVotes.p2;
  return {
    ...state,
    votes: nextVotes,
    revealed: bothVoted,
    matches: matched ? state.matches + 1 : state.matches,
    roundsPlayed: bothVoted ? state.roundsPlayed + 1 : state.roundsPlayed,
  };
}

export function nextLoveQuizRound(state: LoveQuizState): LoveQuizState {
  return {
    ...state,
    questionIndex: (state.questionIndex + 1) % LOVE_QUIZ_QUESTIONS.length,
    votes: { p1: null, p2: null },
    revealed: false,
  };
}

export function createShuffledMemoryCards(rng: () => number = Math.random): MemoryCard[] {
  const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS].map((item, idx) => ({
    id: idx,
    symbol: item.symbol,
    label: item.label,
    flipped: false,
    matchedBy: null as PlayerSlot | null,
  }));
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.map((card, index) => ({ ...card, id: index }));
}

export function createInitialMemoryMatch(rng: () => number = Math.random): MemoryMatchState {
  return {
    cards: createShuffledMemoryCards(rng),
    flippedIndices: [],
    turnSlot: 1,
    moves: 0,
    matchedPairs: { p1: 0, p2: 0 },
    pendingReset: false,
    completed: false,
  };
}

export function applyMemoryFlip(
  state: MemoryMatchState,
  playerSlot: PlayerSlot,
  index: number,
): MemoryMatchState {
  if (state.completed || state.pendingReset) return state;
  if (playerSlot !== state.turnSlot) return state;
  if (index < 0 || index >= state.cards.length) return state;

  const target = state.cards[index];
  if (target.flipped || target.matchedBy !== null) return state;
  if (state.flippedIndices.includes(index)) return state;

  const nextCards = state.cards.map((c, idx) => (idx === index ? { ...c, flipped: true } : c));
  const nextFlipped = [...state.flippedIndices, index];

  if (nextFlipped.length < 2) {
    return {
      ...state,
      cards: nextCards,
      flippedIndices: nextFlipped,
    };
  }

  const [firstIdx, secondIdx] = nextFlipped;
  const firstCard = nextCards[firstIdx];
  const secondCard = nextCards[secondIdx];
  const isMatch = firstCard.symbol === secondCard.symbol;

  if (isMatch) {
    const updatedCards = nextCards.map((c, idx) =>
      idx === firstIdx || idx === secondIdx ? { ...c, matchedBy: playerSlot } : c,
    );
    const nextMatchedPairs = {
      p1: playerSlot === 1 ? state.matchedPairs.p1 + 1 : state.matchedPairs.p1,
      p2: playerSlot === 2 ? state.matchedPairs.p2 + 1 : state.matchedPairs.p2,
    };
    const completed = updatedCards.every((c) => c.matchedBy !== null);
    return {
      ...state,
      cards: updatedCards,
      flippedIndices: [],
      moves: state.moves + 1,
      matchedPairs: nextMatchedPairs,
      pendingReset: false,
      completed,
    };
  }

  return {
    ...state,
    cards: nextCards,
    flippedIndices: nextFlipped,
    moves: state.moves + 1,
    pendingReset: true,
  };
}

export function resolveMemoryMismatch(state: MemoryMatchState): MemoryMatchState {
  if (!state.pendingReset) return state;
  const [firstIdx, secondIdx] = state.flippedIndices;
  const nextCards = state.cards.map((c, idx) =>
    idx === firstIdx || idx === secondIdx ? { ...c, flipped: false } : c,
  );
  return {
    ...state,
    cards: nextCards,
    flippedIndices: [],
    pendingReset: false,
    turnSlot: state.turnSlot === 1 ? 2 : 1,
  };
}

export function createInitialNeverHaveIEver(): NeverHaveIEverState {
  return {
    promptIndex: 0,
    usedIndices: [0],
    responses: { p1: null, p2: null },
    revealed: false,
  };
}

export function respondNeverHaveIEver(
  state: NeverHaveIEverState,
  playerSlot: PlayerSlot,
  response: 'have' | 'never',
): NeverHaveIEverState {
  const nextResponses = {
    ...state.responses,
    [playerSlot === 1 ? 'p1' : 'p2']: response,
  };
  return {
    ...state,
    responses: nextResponses,
    revealed: Boolean(nextResponses.p1 && nextResponses.p2),
  };
}

export function nextNeverHaveIEver(
  state: NeverHaveIEverState,
  rng: () => number = Math.random,
): NeverHaveIEverState {
  const all = NEVER_HAVE_I_EVER_PROMPTS.map((_, idx) => idx);
  const unused = all.filter((idx) => !state.usedIndices.includes(idx));
  const pool = unused.length > 0 ? unused : all.filter((idx) => idx !== state.promptIndex);
  const nextIdx = pool[Math.floor(rng() * pool.length)] ?? 0;
  return {
    promptIndex: nextIdx,
    usedIndices: unused.length === 0 ? [nextIdx] : [...state.usedIndices, nextIdx],
    responses: { p1: null, p2: null },
    revealed: false,
  };
}

export function createInitialWouldYouRather(): WouldYouRatherState {
  return {
    promptIndex: 0,
    usedIndices: [0],
    choices: { p1: null, p2: null },
    revealed: false,
    matches: 0,
  };
}

export function chooseWouldYouRather(
  state: WouldYouRatherState,
  playerSlot: PlayerSlot,
  choice: 'A' | 'B',
): WouldYouRatherState {
  if (state.revealed) return state;
  const nextChoices = {
    ...state.choices,
    [playerSlot === 1 ? 'p1' : 'p2']: choice,
  };
  const bothChosen = nextChoices.p1 !== null && nextChoices.p2 !== null;
  const matched = bothChosen && nextChoices.p1 === nextChoices.p2;
  return {
    ...state,
    choices: nextChoices,
    revealed: bothChosen,
    matches: matched ? state.matches + 1 : state.matches,
  };
}

export function nextWouldYouRather(
  state: WouldYouRatherState,
  rng: () => number = Math.random,
): WouldYouRatherState {
  const all = WOULD_YOU_RATHER_PROMPTS.map((_, idx) => idx);
  const unused = all.filter((idx) => !state.usedIndices.includes(idx));
  const pool = unused.length > 0 ? unused : all.filter((idx) => idx !== state.promptIndex);
  const nextIdx = pool[Math.floor(rng() * pool.length)] ?? 0;
  return {
    ...state,
    promptIndex: nextIdx,
    usedIndices: unused.length === 0 ? [nextIdx] : [...state.usedIndices, nextIdx],
    choices: { p1: null, p2: null },
    revealed: false,
  };
}

export function buildMaskedWord(secretWord: string, guessedLetters: string[]): string {
  return secretWord
    .split('')
    .map((ch) => (guessedLetters.includes(ch) ? ch : '_'))
    .join(' ');
}

export function createInitialGuessTheWord(
  setterSlot: PlayerSlot = 1,
  roundsWon = 0,
  rng: () => number = Math.random,
): GuessTheWordState {
  const categoryObj = WORD_CATEGORIES[Math.floor(rng() * WORD_CATEGORIES.length)];
  const wordOptions = categoryObj.words.slice(0, 3).map((w) => w.word);
  return {
    setterSlot,
    category: categoryObj.category,
    secretWord: '',
    maskedWord: '',
    hint: '',
    hintRevealed: false,
    guessedLetters: [],
    wrongLetters: [],
    maxAttempts: 6,
    phase: 'choosing',
    wordOptions,
    roundsWon,
  };
}

export function pickGuessWord(
  state: GuessTheWordState,
  playerSlot: PlayerSlot,
  rawWord: string,
  customHint: string,
): GuessTheWordState {
  if (state.phase !== 'choosing' || playerSlot !== state.setterSlot) return state;
  const cleanedWord = rawWord.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 14);
  if (cleanedWord.length < 3) return state;

  let fallbackHint = 'A cozy word chosen just for you';
  for (const cat of WORD_CATEGORIES) {
    const found = cat.words.find((w) => w.word === cleanedWord);
    if (found) {
      fallbackHint = found.defaultHint;
      break;
    }
  }

  return {
    ...state,
    secretWord: cleanedWord,
    maskedWord: buildMaskedWord(cleanedWord, []),
    hint: customHint.trim().slice(0, 80) || fallbackHint,
    hintRevealed: false,
    guessedLetters: [],
    wrongLetters: [],
    phase: 'guessing',
  };
}

export function guessWordLetter(
  state: GuessTheWordState,
  playerSlot: PlayerSlot,
  rawLetter: string,
): GuessTheWordState {
  if (state.phase !== 'guessing' || playerSlot === state.setterSlot) return state;
  const letter = rawLetter.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
  if (!letter) return state;
  if (state.guessedLetters.includes(letter) || state.wrongLetters.includes(letter)) return state;

  const isHit = state.secretWord.includes(letter);
  const guessedLetters = isHit ? [...state.guessedLetters, letter] : state.guessedLetters;
  const wrongLetters = isHit ? state.wrongLetters : [...state.wrongLetters, letter];
  const maskedWord = buildMaskedWord(state.secretWord, guessedLetters);

  const won = state.secretWord.split('').every((ch) => guessedLetters.includes(ch));
  const lost = !won && wrongLetters.length >= state.maxAttempts;

  return {
    ...state,
    guessedLetters,
    wrongLetters,
    maskedWord,
    phase: won ? 'won' : lost ? 'lost' : 'guessing',
    roundsWon: won ? state.roundsWon + 1 : state.roundsWon,
  };
}

export function createInitialCoupleChallenge(): CoupleChallengeState {
  return {
    challengeIndex: 0,
    usedIndices: [0],
    completedCount: 0,
    completedByRound: { p1: false, p2: false },
  };
}

export function completeCoupleChallenge(
  state: CoupleChallengeState,
  playerSlot: PlayerSlot,
): CoupleChallengeState {
  const nextCompleted = {
    ...state.completedByRound,
    [playerSlot === 1 ? 'p1' : 'p2']: true,
  };
  const wasBoth = state.completedByRound.p1 && state.completedByRound.p2;
  const nowBoth = nextCompleted.p1 && nextCompleted.p2;
  return {
    ...state,
    completedByRound: nextCompleted,
    completedCount: !wasBoth && nowBoth ? state.completedCount + 1 : state.completedCount,
  };
}

export function nextCoupleChallenge(
  state: CoupleChallengeState,
  rng: () => number = Math.random,
): CoupleChallengeState {
  const all = COUPLE_CHALLENGES.map((_, idx) => idx);
  const unused = all.filter((idx) => !state.usedIndices.includes(idx));
  const pool = unused.length > 0 ? unused : all.filter((idx) => idx !== state.challengeIndex);
  const nextIdx = pool[Math.floor(rng() * pool.length)] ?? 0;
  return {
    ...state,
    challengeIndex: nextIdx,
    usedIndices: unused.length === 0 ? [nextIdx] : [...state.usedIndices, nextIdx],
    completedByRound: { p1: false, p2: false },
  };
}

export function createInitialGamesState(rng: () => number = Math.random): RoomGamesState {
  return {
    truthOrDare: createInitialTruthOrDare(),
    ticTacToe: createInitialTicTacToe(),
    spinWheel: createInitialSpinWheel(),
    knowMe: createInitialKnowMe(),
    loveQuiz: createInitialLoveQuiz(),
    memoryMatch: createInitialMemoryMatch(rng),
    neverHaveIEver: createInitialNeverHaveIEver(),
    wouldYouRather: createInitialWouldYouRather(),
    guessTheWord: createInitialGuessTheWord(1, 0, rng),
    coupleChallenge: createInitialCoupleChallenge(),
  };
}
