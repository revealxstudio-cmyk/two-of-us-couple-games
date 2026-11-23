import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceTruthOrDareTurn,
  applyMemoryFlip,
  applyTicTacToeMove,
  awardKnowMePoint,
  chooseWouldYouRather,
  completeCoupleChallenge,
  createInitialCoupleChallenge,
  createInitialGuessTheWord,
  createInitialKnowMe,
  createInitialLoveQuiz,
  createInitialMemoryMatch,
  createInitialSpinWheel,
  createInitialTicTacToe,
  createInitialTruthOrDare,
  createInitialWouldYouRather,
  guessWordLetter,
  nextCoupleChallenge,
  normalizeRoomCode,
  pickGuessWord,
  pickTruthOrDarePrompt,
  resolveMemoryMismatch,
  restartTicTacToe,
  spinWheelState,
  submitKnowMeAnswer,
  submitLoveQuizVote,
  validateNickname,
} from './gameLogic.ts';

test('nickname and room code validation sanitize and reject invalid inputs', () => {
  assert.equal(normalizeRoomCode('ab-c123xyz'), 'ABC123');
  assert.deepEqual(validateNickname('   '), {
    ok: false,
    error: 'Please enter a cute nickname first.',
  });
  assert.deepEqual(validateNickname('  My   Love  '), {
    ok: true,
    nickname: 'My Love',
  });
});

test('Tic-Tac-Toe enforces turns, prevents overwrite, detects win & restarts cleanly', () => {
  let state = createInitialTicTacToe();
  // Player 2 cannot move on Player 1 turn
  state = applyTicTacToeMove(state, 2, 0);
  assert.equal(state.board[0], null);

  state = applyTicTacToeMove(state, 1, 0); // X
  // Cannot overwrite occupied square
  state = applyTicTacToeMove(state, 2, 0);
  assert.equal(state.board[0], 'X');
  assert.equal(state.turnSlot, 2);

  state = applyTicTacToeMove(state, 2, 3); // O
  state = applyTicTacToeMove(state, 1, 1); // X
  state = applyTicTacToeMove(state, 2, 4); // O
  state = applyTicTacToeMove(state, 1, 2); // X wins top row

  assert.equal(state.winnerSlot, 1);
  assert.deepEqual(state.winningLine, [0, 1, 2]);
  assert.equal(state.scores.p1, 1);

  const restarted = restartTicTacToe(state);
  assert.equal(restarted.winnerSlot, null);
  assert.equal(restarted.board.every((c) => c === null), true);
  assert.equal(restarted.scores.p1, 1);
});

test('Truth or Dare draws without immediate repeat and rotates turns', () => {
  let state = createInitialTruthOrDare();
  state = pickTruthOrDarePrompt(state, 'truth', () => 0);
  const firstId = state.currentPrompt?.id;
  assert.ok(firstId);
  assert.equal(state.roundCount, 1);

  state = advanceTruthOrDareTurn(state, false);
  assert.equal(state.turnSlot, 2);
  assert.equal(state.currentPrompt, null);

  state = pickTruthOrDarePrompt(state, 'truth', () => 0);
  assert.notEqual(state.currentPrompt?.id, firstId);

  // Skip preserves current turn
  state = advanceTruthOrDareTurn(state, true);
  assert.equal(state.turnSlot, 2);
});

test('Spin the Wheel lands deterministically on chosen segment and advances turn', () => {
  const initial = createInitialSpinWheel();
  const spun = spinWheelState(initial, 1, () => 0.35);
  assert.equal(spun.spinning, true);
  assert.equal(spun.selectedIndex, 3);
  assert.equal(spun.selectedLabel, 'Truth');
  assert.equal(spun.turnSlot, 2);
  assert.ok(spun.rotationDeg > 1000);
});

test('Memory Match matches pairs, keeps turn on match, and switches on mismatch', () => {
  let state = createInitialMemoryMatch(() => 0.42);
  const firstSymbol = state.cards[0].symbol;
  const matchIdx = state.cards.findIndex((c, idx) => idx !== 0 && c.symbol === firstSymbol);
  const mismatchIdx = state.cards.findIndex((c, idx) => idx !== 0 && c.symbol !== firstSymbol);

  state = applyMemoryFlip(state, 1, 0);
  state = applyMemoryFlip(state, 1, matchIdx);
  assert.equal(state.matchedPairs.p1, 1);
  assert.equal(state.turnSlot, 1);
  assert.equal(state.pendingReset, false);

  const nextAvailable = state.cards.findIndex((c) => c.matchedBy === null);
  const mismatchForNext = state.cards.findIndex(
    (c, idx) => idx !== nextAvailable && c.matchedBy === null && c.symbol !== state.cards[nextAvailable].symbol,
  );
  assert.ok(mismatchIdx >= 0);

  state = applyMemoryFlip(state, 1, nextAvailable);
  state = applyMemoryFlip(state, 1, mismatchForNext);
  assert.equal(state.pendingReset, true);

  state = resolveMemoryMismatch(state);
  assert.equal(state.pendingReset, false);
  assert.equal(state.turnSlot, 2);
});

test('Quizzes and Would You Rather reveal only after both players respond', () => {
  let knowMe = createInitialKnowMe();
  knowMe = submitKnowMeAnswer(knowMe, 1, 'Pasta');
  assert.equal(knowMe.revealed, false);
  knowMe = submitKnowMeAnswer(knowMe, 2, 'Pasta');
  assert.equal(knowMe.revealed, true);
  knowMe = awardKnowMePoint(knowMe, true);
  assert.equal(knowMe.scores.p2, 1);

  let loveQuiz = createInitialLoveQuiz();
  loveQuiz = submitLoveQuizVote(loveQuiz, 1, 2);
  assert.equal(loveQuiz.revealed, false);
  loveQuiz = submitLoveQuizVote(loveQuiz, 2, 2);
  assert.equal(loveQuiz.revealed, true);
  assert.equal(loveQuiz.matches, 1);

  let wyr = createInitialWouldYouRather();
  wyr = chooseWouldYouRather(wyr, 1, 'A');
  assert.equal(wyr.revealed, false);
  wyr = chooseWouldYouRather(wyr, 2, 'A');
  assert.equal(wyr.revealed, true);
  assert.equal(wyr.matches, 1);
});

test('Guess the Word handles word setup, correct guesses, wrong guesses, and completion', () => {
  let wordState = createInitialGuessTheWord(1, 0, () => 0);
  wordState = pickGuessWord(wordState, 1, 'LOVE', 'A warm feeling');
  assert.equal(wordState.phase, 'guessing');
  assert.equal(wordState.maskedWord, '_ _ _ _');

  wordState = guessWordLetter(wordState, 2, 'L');
  wordState = guessWordLetter(wordState, 2, 'O');
  wordState = guessWordLetter(wordState, 2, 'V');
  wordState = guessWordLetter(wordState, 2, 'Z'); // wrong guess
  assert.equal(wordState.wrongLetters.length, 1);
  wordState = guessWordLetter(wordState, 2, 'E');
  assert.equal(wordState.phase, 'won');
  assert.equal(wordState.roundsWon, 1);
});

test('Couple Challenge increments completed count only when both finish', () => {
  let challenge = createInitialCoupleChallenge();
  challenge = completeCoupleChallenge(challenge, 1);
  assert.equal(challenge.completedCount, 0);
  challenge = completeCoupleChallenge(challenge, 2);
  assert.equal(challenge.completedCount, 1);
  challenge = nextCoupleChallenge(challenge, () => 0.5);
  assert.equal(challenge.completedByRound.p1, false);
  assert.equal(challenge.completedByRound.p2, false);
});
