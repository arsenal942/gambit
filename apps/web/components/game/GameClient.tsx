"use client";

import { useGameState } from "@/hooks/useGameState";
import { useBoardInteraction } from "@/hooks/useBoardInteraction";
import { useGameSounds } from "@/hooks/useGameSounds";
import { GameBoard } from "./GameBoard";
import { TurnIndicator } from "./TurnIndicator";
import { CheckAlert } from "./CheckAlert";
import { CapturedPiecesTray } from "./CapturedPiecesTray";
import { MoveHistory } from "./MoveHistory";
import { GameOverOverlay } from "./GameOverOverlay";
import { GameControls } from "./GameControls";
import { PromotionModal } from "./PromotionModal";
import { RansomModal } from "./RansomModal";

export function GameClient() {
  const {
    gameState,
    legalMoves,
    dispatch,
    newGame,
    forfeitGame,
    offerDrawGame,
    lastMove,
    error,
  } = useGameState();

  const {
    selectedPieceId,
    highlights,
    pushbackArrows,
    onTileClick,
    onPushDirectionClick,
    clearSelection,
  } = useBoardInteraction(gameState, legalMoves, dispatch);

  // Sound effects — local hotseat, no player color
  useGameSounds(gameState);

  const lastMoveHighlight = lastMove
    ? { from: lastMove.from, to: lastMove.to }
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8 lg:py-8">
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
        />

        {/* Overlays */}
        {gameState.gamePhase === "ended" && (
          <GameOverOverlay
            winner={gameState.winner}
            winCondition={gameState.winCondition}
            onNewGame={newGame}
          />
        )}
        {gameState.gamePhase === "awaitingPromotion" && (
          <PromotionModal gameState={gameState} dispatch={dispatch} />
        )}
        {gameState.gamePhase === "awaitingRansom" && (
          <RansomModal gameState={gameState} dispatch={dispatch} />
        )}
      </div>

      {/* Sidebar */}
      <div className="mt-4 w-full max-w-[640px] space-y-3 lg:mt-0 lg:w-72">
        <TurnIndicator turn={gameState.turn} gamePhase={gameState.gamePhase} />
        <CheckAlert checkPlayer={gameState.checkPlayer} />

        {error && (
          <div className="rounded-lg border border-yellow-600 bg-yellow-950 px-3 py-2 text-xs text-yellow-400">
            {error}
          </div>
        )}

        <CapturedPiecesTray capturedPieces={gameState.capturedPieces} />
        <MoveHistory moveHistory={gameState.moveHistory} />

        <GameControls
          turn={gameState.turn}
          gamePhase={gameState.gamePhase}
          turnsSinceCapture={gameState.turnsSinceCapture}
          onNewGame={newGame}
          onForfeit={forfeitGame}
          onOfferDraw={offerDrawGame}
        />
      </div>
    </div>
  );
}
