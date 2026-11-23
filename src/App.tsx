import { useState, type ReactElement } from 'react';
import { Backdrop } from './components/Backdrop';
import { GameLounge } from './components/GameLounge';
import { InteractionsBar } from './components/InteractionsBar';
import { RoomHeader } from './components/RoomHeader';
import { RoomSetupScreen } from './components/RoomSetupScreen';
import { WaitingBanner } from './components/WaitingBanner';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CoupleChallengeGame } from './components/games/CoupleChallengeGame';
import { GuessTheWordGame } from './components/games/GuessTheWordGame';
import { KnowMeQuizGame } from './components/games/KnowMeQuizGame';
import { LoveQuizGame } from './components/games/LoveQuizGame';
import { MemoryMatchGame } from './components/games/MemoryMatchGame';
import { NeverHaveIEverGame } from './components/games/NeverHaveIEverGame';
import { SpinTheWheelGame } from './components/games/SpinTheWheelGame';
import { TicTacToeGame } from './components/games/TicTacToeGame';
import { TruthOrDareGame } from './components/games/TruthOrDareGame';
import { WouldYouRatherGame } from './components/games/WouldYouRatherGame';
import { useRoomConnection } from './hooks/useRoomConnection';
import type { GameId } from './shared/types';

type ScreenMode = 'welcome' | 'create' | 'join';

export default function App(): ReactElement {
  const [setupMode, setSetupMode] = useState<ScreenMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'create';
    }
    return 'welcome';
  });

  const {
    phase,
    room,
    mySlot,
    errorMessage,
    reactions,
    activeHug,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    clearError,
    resetExpired,
  } = useRoomConnection();

  const renderActiveGame = (gameId: GameId) => {
    if (!room || !mySlot) return null;
    const handleBack = () => sendMessage({ type: 'game:select', game: null });

    switch (gameId) {
      case 'truth-or-dare':
        return (
          <TruthOrDareGame
            state={room.games.truthOrDare}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'tic-tac-toe':
        return (
          <TicTacToeGame
            state={room.games.ticTacToe}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'spin-the-wheel':
        return (
          <SpinTheWheelGame
            state={room.games.spinWheel}
            players={room.players}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'know-me':
        return (
          <KnowMeQuizGame
            state={room.games.knowMe}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'love-quiz':
        return (
          <LoveQuizGame
            state={room.games.loveQuiz}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'memory-match':
        return (
          <MemoryMatchGame
            state={room.games.memoryMatch}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'never-have-i-ever':
        return (
          <NeverHaveIEverGame
            state={room.games.neverHaveIEver}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'would-you-rather':
        return (
          <WouldYouRatherGame
            state={room.games.wouldYouRather}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'guess-the-word':
        return (
          <GuessTheWordGame
            state={room.games.guessTheWord}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
      case 'couple-challenge':
        return (
          <CoupleChallengeGame
            state={room.games.coupleChallenge}
            players={room.players}
            mySlot={mySlot}
            onSend={sendMessage}
            onBack={handleBack}
          />
        );
    }
  };

  if (phase === 'room_expired' && !room) {
    return (
      <>
        <Backdrop />
        <main className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
          <div className="glass-card-strong animate-pop-in w-full rounded-[2rem] p-8">
            <h1 className="font-display text-2xl font-semibold text-[#3b2230]">
              Room No Longer Available
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#6f5061]">
              {errorMessage ?? 'Your little room is no longer available.'}
            </p>
            <button
              type="button"
              onClick={() => {
                resetExpired();
                setSetupMode('welcome');
              }}
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#d45279] px-6 py-3 text-sm font-semibold text-white hover:bg-[#be4067] cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </main>
      </>
    );
  }

  if (room && mySlot) {
    return (
      <>
        <Backdrop />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 pt-3 pb-10 sm:px-6 sm:pt-4">
          <RoomHeader
            roomCode={room.code}
            phase={phase}
            activeGame={room.activeGame}
            onBackToLounge={() => sendMessage({ type: 'game:select', game: null })}
            onLeaveRoom={() => {
              leaveRoom();
              setSetupMode('welcome');
            }}
          />

          {!room.activeGame && (
            <WaitingBanner
              roomCode={room.code}
              players={room.players}
              mySlot={mySlot}
              phase={phase}
              justConnectedBanner={room.justConnectedBanner}
            />
          )}

          {!room.activeGame && (
            <InteractionsBar
              reactions={reactions}
              activeHug={activeHug}
              onSendReaction={(emoji, kind) =>
                sendMessage({ type: 'reaction:send', emoji, kind })
              }
            />
          )}

          <main className="flex-1">
            {room.activeGame ? (
              <div className="space-y-4">
                {renderActiveGame(room.activeGame)}
                <InteractionsBar
                  reactions={reactions}
                  activeHug={activeHug}
                  onSendReaction={(emoji, kind) =>
                    sendMessage({ type: 'reaction:send', emoji, kind })
                  }
                />
              </div>
            ) : (
              <GameLounge
                isTogether={phase === 'connected'}
                onSelectGame={(game) => sendMessage({ type: 'game:select', game })}
              />
            )}
          </main>
        </div>
      </>
    );
  }

  if (setupMode === 'create' || setupMode === 'join') {
    return (
      <>
        <Backdrop />
        <div className="relative z-10">
          <RoomSetupScreen
            mode={setupMode}
            isConnecting={phase === 'connecting'}
            errorMessage={errorMessage}
            onBack={() => {
              clearError();
              setSetupMode('welcome');
            }}
            onSwitchMode={(next) => {
              clearError();
              setSetupMode(next);
            }}
            onCreate={createRoom}
            onJoin={joinRoom}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Backdrop />
      <div className="relative z-10">
        <WelcomeScreen
          onCreateClick={() => {
            clearError();
            setSetupMode('create');
          }}
          onJoinClick={() => {
            clearError();
            setSetupMode('join');
          }}
        />
      </div>
    </>
  );
}
