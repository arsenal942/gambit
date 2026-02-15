"use client";

import { useBotGameState, type BotGameConfig } from "@/hooks/useBotGameState";
import { useBoardInteraction } from "@/hooks/useBoardInteraction";
import { useGameSounds } from "@/hooks/useGameSounds";
import { GameBoard } from "./GameBoard";
import { TurnIndicator } from "./TurnIndicator";
import { CheckAlert } from "./CheckAlert";
import { CapturedPiecesTray } from "./CapturedPiecesTray";
import { MoveHistory } from "./MoveHistory";
import { GameOverOverlay } from "./GameOverOverlay";
import { PromotionModal } from "./PromotionModal";
import { RansomModal } from "./RansomModal";
import { BotGameControls } from "./BotGameControls";
import { BotThinkingIndicator } from "./BotThinkingIndicator";

interface BotGameClientProps {
  config: BotGameConfig;
  onBack: () => void;
}

export function BotGameClient({ config, onBack }: BotGameClientProps) {
  const botGame = useBotGameState(config);
  const {
    selectedPieceId,
    highlights,
    pushbackArrows,
    onTileClick,
    onPushDirectionClick,
  } = useBoardInteraction(botGame.gameState, botGame.legalMoves, botGame.dispatch);

  // Sound effects — play from player perspective
  useGameSounds(botGame.gameState, { playerColor: config.playerColor });

  const flipBoard = config.playerColor === "black";
  const isMyTurn = botGame.gameState.turn === config.playerColor;

  const showPromotion =
    botGame.gameState.gamePhase === "awaitingPromotion" && isMyTurn;
  const showRansom =
    botGame.gameState.gamePhase === "awaitingRansom" && isMyTurn;

  const lastMoveHighlight = botGame.lastMove
    ? { from: botGame.lastMove.from, to: botGame.lastMove.to }
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8 lg:py-8">
      {/* Board section */}
      <div className="relative w-full max-w-[640px]">
        <GameBoard
          board={botGame.gameState.board}
          selectedPieceId={selectedPieceId}
          highlights={highlights}
          pushbackArrows={pushbackArrows}
          lastMove={lastMoveHighlight}
          onTileClick={onTileClick}
          onPushDirectionClick={onPushDirectionClick}
          flipBoard={flipBoard}
        />

        {/* Overlays */}
        {botGame.gameState.gamePhase === "ended" && (
          <GameOverOverlay
            winner={botGame.gameState.winner}
            winCondition={botGame.gameState.winCondition}
            onNewGame={botGame.newGame}
            playerColor={config.playerColor}
          />
        )}
        {showPromotion && (
          <PromotionModal
            gameState={botGame.gameState}
            dispatch={botGame.dispatch}
          />
        )}
        {showRansom && (
          <RansomModal
            gameState={botGame.gameState}
            dispatch={botGame.dispatch}
          />
        )}
      </div>

      {/* Sidebar */}
      <div className="mt-4 w-full max-w-[640px] space-y-3 lg:mt-0 lg:w-72">
        {/* Opponent info */}
        <div className="rounded-lg bg-gray-800 px-4 py-3 text-center">
          <div className="text-sm font-semibold text-gray-200">
            vs {config.botProfile.name}
          </div>
          <div className="text-xs text-gray-500">
            Rating: {config.botProfile.rating}
          </div>
        </div>

        <TurnIndicator
          turn={botGame.gameState.turn}
          gamePhase={botGame.gameState.gamePhase}
        />

        {botGame.isBotThinking && (
          <BotThinkingIndicator botName={config.botProfile.name} />
        )}

        <CheckAlert checkPlayer={botGame.gameState.checkPlayer} />

        {botGame.error && (
          <div className="rounded-lg border border-yellow-600 bg-yellow-950 px-3 py-2 text-xs text-yellow-400">
            {botGame.error}
          </div>
        )}

        <CapturedPiecesTray capturedPieces={botGame.gameState.capturedPieces} />
        <MoveHistory moveHistory={botGame.gameState.moveHistory} />

        <BotGameControls
          gamePhase={botGame.gameState.gamePhase}
          onNewGame={botGame.newGame}
          onForfeit={botGame.forfeitGame}
          onBack={onBack}
        />
      </div>
    </div>
  );
}
