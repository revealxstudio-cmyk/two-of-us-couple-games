import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AvatarId,
  ClientMessage,
  ConnectionPhase,
  PlayerSlot,
  ReactionEvent,
  RoomSnapshot,
  ServerMessage,
} from '../shared/types';
import { playSoftTone, playTapChime } from '../utils/sound';

interface RoomConnectionState {
  phase: ConnectionPhase;
  room: RoomSnapshot | null;
  playerId: string | null;
  mySlot: PlayerSlot | null;
  errorMessage: string | null;
  reactions: ReactionEvent[];
  activeHug: ReactionEvent | null;
  createRoom: (nickname: string, avatar: AvatarId) => void;
  joinRoom: (code: string, nickname: string, avatar: AvatarId) => void;
  leaveRoom: () => void;
  sendMessage: (msg: ClientMessage) => void;
  clearError: () => void;
  resetExpired: () => void;
}

function computePhase(room: RoomSnapshot | null, mySlot: PlayerSlot | null, socketOpen: boolean): ConnectionPhase {
  if (!room) return socketOpen ? 'idle' : 'connection_failed';
  if (!socketOpen) return 'connection_failed';
  if (room.players.length < 2) return 'waiting';
  const partner = room.players.find((p) => p.slot !== mySlot);
  if (!partner) return 'waiting';
  if (!partner.connected) return 'partner_disconnected';
  return 'connected';
}

export function useRoomConnection(): RoomConnectionState {
  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<ClientMessage[]>([]);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sessionRef = useRef<{ code: string; playerId: string; slot: PlayerSlot } | null>(null);
  const manualLeaveRef = useRef(false);

  const [socketOpen, setSocketOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [mySlot, setMySlot] = useState<PlayerSlot | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);
  const [activeHug, setActiveHug] = useState<ReactionEvent | null>(null);

  const connectSocket = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setSocketOpen(true);
      setIsConnecting(false);

      if (sessionRef.current) {
        ws.send(
          JSON.stringify({
            type: 'room:reconnect',
            code: sessionRef.current.code,
            playerId: sessionRef.current.playerId,
          } satisfies ClientMessage),
        );
      }

      while (queueRef.current.length > 0 && ws.readyState === WebSocket.OPEN) {
        const next = queueRef.current.shift();
        if (next) ws.send(JSON.stringify(next));
      }
    };

    ws.onmessage = (event) => {
      let data: ServerMessage;
      try {
        data = JSON.parse(String(event.data)) as ServerMessage;
      } catch {
        return;
      }

      if (data.type === 'room:joined') {
        sessionRef.current = {
          code: data.room.code,
          playerId: data.playerId,
          slot: data.slot,
        };
        setPlayerId(data.playerId);
        setMySlot(data.slot);
        setRoom(data.room);
        setErrorMessage(null);
        setExpiredMessage(null);
        setIsConnecting(false);
        playSoftTone(587.33, 0.14, 0.04);
        return;
      }

      if (data.type === 'room:state') {
        setRoom(data.room);
        return;
      }

      if (data.type === 'room:error') {
        setIsConnecting(false);
        if (data.code === 'ROOM_EXPIRED') {
          sessionRef.current = null;
          setRoom(null);
          setPlayerId(null);
          setMySlot(null);
          setExpiredMessage(data.message);
        } else {
          setErrorMessage(data.message);
        }
        return;
      }

      if (data.type === 'room:expired') {
        sessionRef.current = null;
        setRoom(null);
        setPlayerId(null);
        setMySlot(null);
        setExpiredMessage(data.message);
        return;
      }

      if (data.type === 'reaction:received') {
        const incoming = data.reaction;
        playTapChime();
        setReactions((prev) => [...prev.slice(-14), incoming]);
        setTimeout(() => {
          setReactions((prev) => prev.filter((item) => item.id !== incoming.id));
        }, 2300);

        if (incoming.kind === 'hug') {
          setActiveHug(incoming);
          if (hugTimerRef.current) clearTimeout(hugTimerRef.current);
          hugTimerRef.current = setTimeout(() => {
            setActiveHug(null);
          }, 3200);
        }
      }
    };

    ws.onclose = () => {
      setSocketOpen(false);
      setIsConnecting(false);
      wsRef.current = null;

      if (!manualLeaveRef.current && sessionRef.current) {
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          connectSocket();
        }, 1600);
      }
    };

    ws.onerror = () => {
      setIsConnecting(false);
    };
  }, []);

  useEffect(() => {
    connectSocket();
    return () => {
      manualLeaveRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (hugTimerRef.current) clearTimeout(hugTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectSocket]);

  const sendMessage = useCallback(
    (msg: ClientMessage) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg));
        return;
      }
      queueRef.current.push(msg);
      setIsConnecting(true);
      connectSocket();
    },
    [connectSocket],
  );

  const createRoom = useCallback(
    (nickname: string, avatar: AvatarId) => {
      manualLeaveRef.current = false;
      setErrorMessage(null);
      setExpiredMessage(null);
      setIsConnecting(true);
      sendMessage({ type: 'room:create', nickname, avatar });
    },
    [sendMessage],
  );

  const joinRoom = useCallback(
    (code: string, nickname: string, avatar: AvatarId) => {
      manualLeaveRef.current = false;
      setErrorMessage(null);
      setExpiredMessage(null);
      setIsConnecting(true);
      sendMessage({ type: 'room:join', code, nickname, avatar });
    },
    [sendMessage],
  );

  const leaveRoom = useCallback(() => {
    if (sessionRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'room:leave' } satisfies ClientMessage));
    }
    sessionRef.current = null;
    setRoom(null);
    setPlayerId(null);
    setMySlot(null);
    setErrorMessage(null);
    setExpiredMessage(null);
    setActiveHug(null);
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);
  const resetExpired = useCallback(() => setExpiredMessage(null), []);

  let phase: ConnectionPhase = 'idle';
  if (expiredMessage) {
    phase = 'room_expired';
  } else if (isConnecting && !room) {
    phase = 'connecting';
  } else if (room) {
    phase = computePhase(room, mySlot, socketOpen);
  }

  return {
    phase,
    room,
    playerId,
    mySlot,
    errorMessage: errorMessage ?? expiredMessage,
    reactions,
    activeHug,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    clearError,
    resetExpired,
  };
}
