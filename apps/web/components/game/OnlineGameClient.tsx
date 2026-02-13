"use client";

import { useRouter } from "next/navigation";
import { useBoardInteraction } from "@/hooks/useBoardInteraction";
import type { OnlineGameState } from "@/hooks/useOnlineGameState";
import type { GameState } from "@gambit/engine";
import { GameBoard } from "./GameBoard";
import { TurnIndicator } from "./TurnIndicator";
import { CheckAlert } from "./CheckAlert";
import { CapturedPiecesTray } from "./CapturedPiecesTray";
import { MoveHistory } from "./MoveHistory";
import { GameOverOverlay } from "./GameOverOverlay";
import { PromotionModal } from "./PromotionModal";
import { RansomModal } from "./RansomModal";
import { OnlineGameControls } from "./OnlineGameControls";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { WaitingOverlay } from "./WaitingOverlay";
import { OpponentDisconnectedBanner } from "./OpponentDisconnectedBanner";
import { DrawOfferModal } from "./DrawOfferModal";
import { playerName } from "@/lib/engine-helpers";

interface OnlineGameClientProps {
  gameId: string;
  onlineState: OnlineGameState;
}

// Minimal empty game state for useBoardInteraction fallback
// (never rendered — just satisfies the hook signature)
const EMPTY_GAME_STATE: GameState = {
  board: [],
  turn: "white",
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  capturePoints: {},
  checkPlayer: null,
  lastPushback: null,
  turnsSinceCapture: 0,
  gamePhase: "playing",
  winner: null,
  winCondition: null,
  pendingPromotion: null,
  pendingRansom: null,
};

export function OnlineGameClient({
  gameId,
  onlineState,
}: OnlineGameClientProps) {
  const router = useRouter();

  const {
    gameState,
    legalMoves,
    dispatch,
    lastMove,
    error,
    playerColor,
    onlinePhase,
    connectionStatus,
    opponentDisconnected,
    opponentDisconnectGraceMs,
    drawOffer,
    isMyTurn,
    opponentUsername,
    forfeitGame,
    offerDrawGame,
    acceptDraw,
    declineDraw,
  } = onlineState;

  // useBoardInteraction works on whatever state we have.
  // legalMoves is empty when not our turn, so interaction is naturally disabled.
  const {
    selectedPieceId,
    highlights,
    pushbackArrows,
    onTileClick,
    onPushDirectionClick,
  } = useBoardInteraction(
    gameState ?? EMPTY_GAME_STATE,
    legalMoves,
    dispatch,
  );

  const flipBoard = playerColor === "black";

  // Waiting for opponent
  if (onlinePhase === "waiting") {
    return (
      <>
        <ConnectionIndicator status={connectionStatus} />
        <WaitingOverlay gameId={gameId} />
      </>
    );
  }

  // Connecting or joining
  if (
    !gameState ||
    onlinePhase === "connecting" ||
    onlinePhase === "joining" ||
    onlinePhase === "creating"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        <ConnectionIndicator status={connectionStatus} />
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          <span className="text-sm">Connecting...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (onlinePhase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-400">
        <p className="text-red-400">{error ?? "Something went wrong"}</p>
        <button
          onClick={() => router.push("/game/online")}
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          Back to Lobby
        </button>
      </div>
    );
  }

  const lastMoveHighlight = lastMove
    ? { from: lastMove.from, to: lastMove.to }
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8 lg:py-8">
      <ConnectionIndicator status={connectionStatus} />

      {opponentDisconnected && (
        <OpponentDisconnectedBanner
          gracePeriodMs={opponentDisconnectGraceMs}
        />
      )}

      {/* Board section */}
      <div className="relative w-full max-w-[640px]">
        <GameBoard
          board={gameState.board}
          selectedPieceId={selectedPieceId}
          highlights={highlights}
          pushbackArrows={pushbackArrows}
          lastMove={lastMoveHighlight}
          onTileClick={onTileClick}
          onPushDirectionClick={onPushDirectionClick}
          flipBoard={flipBoard}
        />

        {/* Overlays */}
        {gameState.gamePhase === "ended" && (
          <GameOverOverlay
            winner={gameState.winner}
            winCondition={gameState.winCondition}
            onNewGame={() => router.push("/game/online")}
          />
        )}
        {gameState.gamePhase === "awaitingPromotion" && isMyTurn && (
          <PromotionModal gameState={gameState} dispatch={dispatch} />
        )}
        {gameState.gamePhase === "awaitingRansom" && isMyTurn && (
          <RansomModal gameState={gameState} dispatch={dispatch} />
        )}

        {/* Draw offer received */}
        {drawOffer.pending && !drawOffer.isOurs && (
          <DrawOfferModal onAccept={acceptDraw} onDecline={declineDraw} />
        )}
      </div>

      {/* Sidebar */}
      <div className="mt-4 w-full max-w-[640px] space-y-3 lg:mt-0 lg:w-72">
        {/* Player color badge */}
        {playerColor && (
          <div className="rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-semibold text-gray-300">
            You are {playerName(playerColor)}
            {opponentUsername && (
              <span className="block mt-1 text-xs font-normal text-gray-500">
                vs {opponentUsername}
              </span>
            )}
          </div>
        )}

        <TurnIndicator turn={gameState.turn} gamePhase={gameState.gamePhase} />

        {!isMyTurn && gameState.gamePhase !== "ended" && (
          <div className="rounded-lg bg-gray-800 px-4 py-2 text-center text-xs text-gray-400">
            Waiting for opponent&apos;s move...
          </div>
        )}

        <CheckAlert checkPlayer={gameState.checkPlayer} />

        {error && (
          <div className="rounded-lg border border-yellow-600 bg-yellow-950 px-3 py-2 text-xs text-yellow-400">
            {error}
          </div>
        )}

        <CapturedPiecesTray capturedPieces={gameState.capturedPieces} />
        <MoveHistory moveHistory={gameState.moveHistory} />

        <OnlineGameControls
          gamePhase={gameState.gamePhase}
          turnsSinceCapture={gameState.turnsSinceCapture}
          onForfeit={forfeitGame}
          onOfferDraw={offerDrawGame}
          drawOffer={drawOffer}
        />
      </div>
    </div>
  );
}
