import crypto from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import {
  advanceTruthOrDareTurn,
  applyMemoryFlip,
  applyTicTacToeMove,
  awardKnowMePoint,
  chooseWouldYouRather,
  completeCoupleChallenge,
  createInitialGamesState,
  createInitialGuessTheWord,
  createInitialMemoryMatch,
  generateRoomCode,
  guessWordLetter,
  nextCoupleChallenge,
  nextKnowMeRound,
  nextLoveQuizRound,
  nextNeverHaveIEver,
  nextWouldYouRather,
  normalizeRoomCode,
  pickGuessWord,
  pickTruthOrDarePrompt,
  resolveMemoryMismatch,
  respondNeverHaveIEver,
  restartTicTacToe,
  spinWheelState,
  submitKnowMeAnswer,
  submitLoveQuizVote,
  validateNickname,
} from './src/shared/gameLogic.ts';
import type {
  AvatarId,
  ClientMessage,
  GameId,
  PlayerInfo,
  PlayerSlot,
  ReactionEvent,
  RoomGamesState,
  RoomSnapshot,
  ServerMessage,
} from './src/shared/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_AVATARS = new Set<AvatarId>([
  'heart',
  'moon',
  'star',
  'flower',
  'cloud',
  'sparkles',
]);

const ALLOWED_GAMES = new Set<GameId>([
  'truth-or-dare',
  'tic-tac-toe',
  'spin-the-wheel',
  'know-me',
  'love-quiz',
  'memory-match',
  'never-have-i-ever',
  'would-you-rather',
  'guess-the-word',
  'couple-challenge',
]);

interface ConnectedMember {
  info: PlayerInfo;
  socket: WebSocket | null;
  lastSeenAt: number;
}

interface ServerRoom {
  code: string;
  members: ConnectedMember[];
  activeGame: GameId | null;
  justConnectedBanner: boolean;
  games: RoomGamesState;
  createdAt: number;
  lastActivityAt: number;
  expiryTimer: ReturnType<typeof setTimeout> | null;
  spinTimer: ReturnType<typeof setTimeout> | null;
  memoryTimer: ReturnType<typeof setTimeout> | null;
}

interface SocketSession {
  roomCode: string;
  playerId: string;
  slot: PlayerSlot;
}

const rooms = new Map<string, ServerRoom>();
const socketSessions = new WeakMap<WebSocket, SocketSession>();

function send(ws: WebSocket | null, payload: ServerMessage): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
}

function sanitizeRoomForSlot(room: ServerRoom, viewerSlot: PlayerSlot): RoomSnapshot {
  const games = room.games;

  const sanitizedKnowMe = games.knowMe.revealed
    ? games.knowMe
    : {
        ...games.knowMe,
        answers: {
          p1: viewerSlot === 1 ? games.knowMe.answers.p1 : games.knowMe.answers.p1 ? '__LOCKED__' : null,
          p2: viewerSlot === 2 ? games.knowMe.answers.p2 : games.knowMe.answers.p2 ? '__LOCKED__' : null,
        },
      };

  const sanitizedLoveQuiz = games.loveQuiz.revealed
    ? games.loveQuiz
    : {
        ...games.loveQuiz,
        votes: {
          p1: viewerSlot === 1 ? games.loveQuiz.votes.p1 : games.loveQuiz.votes.p1 ? (1 as PlayerSlot) : null,
          p2: viewerSlot === 2 ? games.loveQuiz.votes.p2 : games.loveQuiz.votes.p2 ? (1 as PlayerSlot) : null,
        },
      };

  const sanitizedWyr = games.wouldYouRather.revealed
    ? games.wouldYouRather
    : {
        ...games.wouldYouRather,
        choices: {
          p1: viewerSlot === 1 ? games.wouldYouRather.choices.p1 : games.wouldYouRather.choices.p1 ? ('A' as const) : null,
          p2: viewerSlot === 2 ? games.wouldYouRather.choices.p2 : games.wouldYouRather.choices.p2 ? ('A' as const) : null,
        },
      };

  const sanitizedNhie = games.neverHaveIEver.revealed
    ? games.neverHaveIEver
    : {
        ...games.neverHaveIEver,
        responses: {
          p1: viewerSlot === 1 ? games.neverHaveIEver.responses.p1 : games.neverHaveIEver.responses.p1 ? ('have' as const) : null,
          p2: viewerSlot === 2 ? games.neverHaveIEver.responses.p2 : games.neverHaveIEver.responses.p2 ? ('have' as const) : null,
        },
      };

  const hideSecretWord =
    viewerSlot !== games.guessTheWord.setterSlot &&
    (games.guessTheWord.phase === 'choosing' || games.guessTheWord.phase === 'guessing');

  const sanitizedWord = hideSecretWord
    ? {
        ...games.guessTheWord,
        secretWord: '',
        hint: games.guessTheWord.hintRevealed ? games.guessTheWord.hint : '',
      }
    : games.guessTheWord;

  return {
    code: room.code,
    players: room.members.map((m) => ({ ...m.info })),
    activeGame: room.activeGame,
    justConnectedBanner: room.justConnectedBanner,
    games: {
      ...games,
      knowMe: sanitizedKnowMe,
      loveQuiz: sanitizedLoveQuiz,
      wouldYouRather: sanitizedWyr,
      neverHaveIEver: sanitizedNhie,
      guessTheWord: sanitizedWord,
    },
  };
}

function broadcastRoom(room: ServerRoom): void {
  for (const member of room.members) {
    if (member.socket && member.socket.readyState === WebSocket.OPEN) {
      send(member.socket, {
        type: 'room:state',
        room: sanitizeRoomForSlot(room, member.info.slot),
      });
    }
  }
}

function destroyRoom(code: string, notifyMessage?: string): void {
  const room = rooms.get(code);
  if (!room) return;
  if (room.expiryTimer) clearTimeout(room.expiryTimer);
  if (room.spinTimer) clearTimeout(room.spinTimer);
  if (room.memoryTimer) clearTimeout(room.memoryTimer);
  if (notifyMessage) {
    for (const member of room.members) {
      send(member.socket, { type: 'room:expired', message: notifyMessage });
    }
  }
  rooms.delete(code);
}

function scheduleRoomCleanupIfEmpty(room: ServerRoom): void {
  if (room.expiryTimer) {
    clearTimeout(room.expiryTimer);
    room.expiryTimer = null;
  }
  const anyConnected = room.members.some((m) => m.info.connected);
  if (!anyConnected) {
    room.expiryTimer = setTimeout(() => {
      destroyRoom(room.code, 'Your little room has quietly closed after everyone stepped away.');
    }, 90_000);
  }
}

function sanitizeAvatar(raw: unknown): AvatarId {
  if (typeof raw === 'string' && ALLOWED_AVATARS.has(raw as AvatarId)) {
    return raw as AvatarId;
  }
  return 'heart';
}

function handleClientMessage(ws: WebSocket, raw: string): void {
  let msg: ClientMessage;
  try {
    msg = JSON.parse(raw) as ClientMessage;
  } catch {
    return;
  }
  if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') return;

  if (msg.type === 'room:create') {
    const nickCheck = validateNickname(String(msg.nickname ?? ''));
    if (!nickCheck.ok) {
      send(ws, { type: 'room:error', code: 'INVALID_NICKNAME', message: nickCheck.error });
      return;
    }
    const existingCodes = new Set(rooms.keys());
    const code = generateRoomCode(existingCodes);
    const playerId = crypto.randomUUID();
    const member: ConnectedMember = {
      info: {
        id: playerId,
        slot: 1,
        nickname: nickCheck.nickname,
        avatar: sanitizeAvatar(msg.avatar),
        connected: true,
        score: 0,
      },
      socket: ws,
      lastSeenAt: Date.now(),
    };
    const room: ServerRoom = {
      code,
      members: [member],
      activeGame: null,
      justConnectedBanner: false,
      games: createInitialGamesState(),
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      expiryTimer: null,
      spinTimer: null,
      memoryTimer: null,
    };
    rooms.set(code, room);
    socketSessions.set(ws, { roomCode: code, playerId, slot: 1 });
    send(ws, {
      type: 'room:joined',
      playerId,
      slot: 1,
      room: sanitizeRoomForSlot(room, 1),
    });
    return;
  }

  if (msg.type === 'room:join') {
    const code = normalizeRoomCode(String(msg.code ?? ''));
    if (code.length < 4) {
      send(ws, {
        type: 'room:error',
        code: 'INVALID_CODE',
        message: 'Please enter a valid 6-character room code.',
      });
      return;
    }
    const room = rooms.get(code);
    if (!room) {
      send(ws, {
        type: 'room:error',
        code: 'INVALID_CODE',
        message: "We couldn't find that little room. Double-check the code?",
      });
      return;
    }
    const nickCheck = validateNickname(String(msg.nickname ?? ''));
    if (!nickCheck.ok) {
      send(ws, { type: 'room:error', code: 'INVALID_NICKNAME', message: nickCheck.error });
      return;
    }
    if (room.members.length >= 2) {
      send(ws, {
        type: 'room:error',
        code: 'ROOM_FULL',
        message: 'This cozy room already has two hearts inside ❤️',
      });
      return;
    }
    const assignedSlot: PlayerSlot = room.members.some((m) => m.info.slot === 1) ? 2 : 1;
    const playerId = crypto.randomUUID();
    const member: ConnectedMember = {
      info: {
        id: playerId,
        slot: assignedSlot,
        nickname: nickCheck.nickname,
        avatar: sanitizeAvatar(msg.avatar),
        connected: true,
        score: 0,
      },
      socket: ws,
      lastSeenAt: Date.now(),
    };
    room.members.push(member);
    room.members.sort((a, b) => a.info.slot - b.info.slot);
    if (room.expiryTimer) {
      clearTimeout(room.expiryTimer);
      room.expiryTimer = null;
    }
    room.justConnectedBanner = room.members.filter((m) => m.info.connected).length === 2;
    room.lastActivityAt = Date.now();
    socketSessions.set(ws, { roomCode: code, playerId, slot: assignedSlot });
    send(ws, {
      type: 'room:joined',
      playerId,
      slot: assignedSlot,
      room: sanitizeRoomForSlot(room, assignedSlot),
    });
    broadcastRoom(room);
    return;
  }

  if (msg.type === 'room:reconnect') {
    const code = normalizeRoomCode(String(msg.code ?? ''));
    const room = rooms.get(code);
    if (!room) {
      send(ws, {
        type: 'room:error',
        code: 'ROOM_EXPIRED',
        message: 'Your little room is no longer available.',
      });
      return;
    }
    const member = room.members.find((m) => m.info.id === msg.playerId);
    if (!member) {
      send(ws, {
        type: 'room:error',
        code: 'ROOM_EXPIRED',
        message: 'Your little room session expired.',
      });
      return;
    }
    member.socket = ws;
    member.info.connected = true;
    member.lastSeenAt = Date.now();
    if (room.expiryTimer) {
      clearTimeout(room.expiryTimer);
      room.expiryTimer = null;
    }
    room.justConnectedBanner = room.members.filter((m) => m.info.connected).length === 2;
    room.lastActivityAt = Date.now();
    socketSessions.set(ws, { roomCode: code, playerId: member.info.id, slot: member.info.slot });
    send(ws, {
      type: 'room:joined',
      playerId: member.info.id,
      slot: member.info.slot,
      room: sanitizeRoomForSlot(room, member.info.slot),
    });
    broadcastRoom(room);
    return;
  }

  const session = socketSessions.get(ws);
  if (!session) return;
  const room = rooms.get(session.roomCode);
  if (!room) {
    send(ws, {
      type: 'room:expired',
      message: 'Your little room is no longer available.',
    });
    return;
  }

  const senderMember = room.members.find((m) => m.info.id === session.playerId);
  if (!senderMember) return;
  room.lastActivityAt = Date.now();
  const slot = session.slot;

  switch (msg.type) {
    case 'room:leave': {
      room.members = room.members.filter((m) => m.info.id !== session.playerId);
      socketSessions.delete(ws);
      room.justConnectedBanner = false;
      if (room.members.length === 0) {
        destroyRoom(room.code);
      } else {
        broadcastRoom(room);
      }
      return;
    }

    case 'game:select': {
      if (msg.game !== null && !ALLOWED_GAMES.has(msg.game)) return;
      room.activeGame = msg.game;
      room.justConnectedBanner = false;
      broadcastRoom(room);
      return;
    }

    case 'reaction:send': {
      const emoji = typeof msg.emoji === 'string' ? msg.emoji.slice(0, 8) : '❤️';
      const kind = msg.kind === 'hug' || msg.kind === 'love' ? msg.kind : 'reaction';
      const reaction: ReactionEvent = {
        id: crypto.randomUUID(),
        emoji,
        fromSlot: slot,
        fromNickname: senderMember.info.nickname,
        kind,
        createdAt: Date.now(),
      };
      for (const member of room.members) {
        send(member.socket, { type: 'reaction:received', reaction });
      }
      return;
    }

    case 'tod:pick': {
      if (slot !== room.games.truthOrDare.turnSlot) return;
      if (msg.choice !== 'truth' && msg.choice !== 'dare') return;
      room.games.truthOrDare = pickTruthOrDarePrompt(room.games.truthOrDare, msg.choice);
      broadcastRoom(room);
      return;
    }

    case 'tod:next': {
      room.games.truthOrDare = advanceTruthOrDareTurn(room.games.truthOrDare, Boolean(msg.skip));
      broadcastRoom(room);
      return;
    }

    case 'ttt:move': {
      if (typeof msg.index !== 'number' || !Number.isInteger(msg.index)) return;
      room.games.ticTacToe = applyTicTacToeMove(room.games.ticTacToe, slot, msg.index);
      broadcastRoom(room);
      return;
    }

    case 'ttt:restart': {
      room.games.ticTacToe = restartTicTacToe(room.games.ticTacToe);
      broadcastRoom(room);
      return;
    }

    case 'wheel:spin': {
      if (room.games.spinWheel.spinning) return;
      room.games.spinWheel = spinWheelState(room.games.spinWheel, slot);
      if (room.spinTimer) clearTimeout(room.spinTimer);
      room.spinTimer = setTimeout(() => {
        const latestRoom = rooms.get(room.code);
        if (!latestRoom) return;
        latestRoom.games.spinWheel = {
          ...latestRoom.games.spinWheel,
          spinning: false,
        };
        broadcastRoom(latestRoom);
      }, 2700);
      broadcastRoom(room);
      return;
    }

    case 'wheel:reset': {
      if (room.spinTimer) {
        clearTimeout(room.spinTimer);
        room.spinTimer = null;
      }
      room.games.spinWheel = {
        ...room.games.spinWheel,
        spinning: false,
        selectedIndex: null,
        selectedLabel: null,
      };
      broadcastRoom(room);
      return;
    }

    case 'knowme:submit': {
      if (typeof msg.answer !== 'string') return;
      room.games.knowMe = submitKnowMeAnswer(room.games.knowMe, slot, msg.answer);
      broadcastRoom(room);
      return;
    }

    case 'knowme:award': {
      if (slot !== room.games.knowMe.spotlightSlot) return;
      room.games.knowMe = awardKnowMePoint(room.games.knowMe, Boolean(msg.point));
      broadcastRoom(room);
      return;
    }

    case 'knowme:next': {
      room.games.knowMe = nextKnowMeRound(room.games.knowMe);
      broadcastRoom(room);
      return;
    }

    case 'lovequiz:vote': {
      if (msg.voteFor !== 1 && msg.voteFor !== 2) return;
      room.games.loveQuiz = submitLoveQuizVote(room.games.loveQuiz, slot, msg.voteFor);
      broadcastRoom(room);
      return;
    }

    case 'lovequiz:next': {
      room.games.loveQuiz = nextLoveQuizRound(room.games.loveQuiz);
      broadcastRoom(room);
      return;
    }

    case 'memory:flip': {
      if (typeof msg.index !== 'number' || !Number.isInteger(msg.index)) return;
      const nextMemory = applyMemoryFlip(room.games.memoryMatch, slot, msg.index);
      room.games.memoryMatch = nextMemory;
      broadcastRoom(room);
      if (nextMemory.pendingReset) {
        if (room.memoryTimer) clearTimeout(room.memoryTimer);
        room.memoryTimer = setTimeout(() => {
          const latestRoom = rooms.get(room.code);
          if (!latestRoom) return;
          latestRoom.games.memoryMatch = resolveMemoryMismatch(latestRoom.games.memoryMatch);
          broadcastRoom(latestRoom);
        }, 900);
      }
      return;
    }

    case 'memory:restart': {
      if (room.memoryTimer) {
        clearTimeout(room.memoryTimer);
        room.memoryTimer = null;
      }
      room.games.memoryMatch = createInitialMemoryMatch();
      broadcastRoom(room);
      return;
    }

    case 'nhie:respond': {
      if (msg.response !== 'have' && msg.response !== 'never') return;
      room.games.neverHaveIEver = respondNeverHaveIEver(room.games.neverHaveIEver, slot, msg.response);
      broadcastRoom(room);
      return;
    }

    case 'nhie:next': {
      room.games.neverHaveIEver = nextNeverHaveIEver(room.games.neverHaveIEver);
      broadcastRoom(room);
      return;
    }

    case 'wyr:choose': {
      if (msg.choice !== 'A' && msg.choice !== 'B') return;
      room.games.wouldYouRather = chooseWouldYouRather(room.games.wouldYouRather, slot, msg.choice);
      broadcastRoom(room);
      return;
    }

    case 'wyr:next': {
      room.games.wouldYouRather = nextWouldYouRather(room.games.wouldYouRather);
      broadcastRoom(room);
      return;
    }

    case 'word:pick': {
      if (typeof msg.word !== 'string') return;
      room.games.guessTheWord = pickGuessWord(
        room.games.guessTheWord,
        slot,
        msg.word,
        typeof msg.hint === 'string' ? msg.hint : '',
      );
      broadcastRoom(room);
      return;
    }

    case 'word:guess': {
      if (typeof msg.letter !== 'string') return;
      room.games.guessTheWord = guessWordLetter(room.games.guessTheWord, slot, msg.letter);
      broadcastRoom(room);
      return;
    }

    case 'word:reveal_hint': {
      room.games.guessTheWord = {
        ...room.games.guessTheWord,
        hintRevealed: true,
      };
      broadcastRoom(room);
      return;
    }

    case 'word:next': {
      const nextSetter: PlayerSlot = room.games.guessTheWord.setterSlot === 1 ? 2 : 1;
      room.games.guessTheWord = createInitialGuessTheWord(
        nextSetter,
        room.games.guessTheWord.roundsWon,
      );
      broadcastRoom(room);
      return;
    }

    case 'challenge:complete': {
      room.games.coupleChallenge = completeCoupleChallenge(room.games.coupleChallenge, slot);
      broadcastRoom(room);
      return;
    }

    case 'challenge:next': {
      room.games.coupleChallenge = nextCoupleChallenge(room.games.coupleChallenge);
      broadcastRoom(room);
      return;
    }
  }
}

async function startServer(): Promise<void> {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 64 * 1024 });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, activeRooms: rooms.size });
  });

  wss.on('connection', (ws) => {
    let messageCount = 0;
    const rateWindow = setInterval(() => {
      messageCount = 0;
    }, 5000);

    ws.on('message', (data) => {
      messageCount += 1;
      if (messageCount > 60) return;
      handleClientMessage(ws, data.toString());
    });

    ws.on('close', () => {
      clearInterval(rateWindow);
      const session = socketSessions.get(ws);
      if (!session) return;
      const room = rooms.get(session.roomCode);
      if (!room) return;
      const member = room.members.find((m) => m.info.id === session.playerId);
      if (!member) return;
      if (member.socket === ws) {
        member.socket = null;
        member.info.connected = false;
        room.justConnectedBanner = false;
        broadcastRoom(room);
        scheduleRoomCleanupIfEmpty(room);
      }
    });
  });

  // Clean up idle rooms older than 2 hours
  setInterval(() => {
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    for (const [code, room] of rooms.entries()) {
      if (room.lastActivityAt < cutoff) {
        destroyRoom(code, 'Your little room expired due to inactivity.');
      }
    }
  }, 5 * 60 * 1000);

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, '0.0.0.0', () => {
    console.log(`TWO OF US server listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TWO OF US server:', err);
  process.exit(1);
});
