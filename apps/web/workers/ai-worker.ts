import { findBestAction } from "@gambit/engine";
import type { GameState } from "@gambit/engine";
import type { BotProfile, SearchResult } from "@gambit/engine";

export interface AIWorkerRequest {
  type: "compute";
  gameState: GameState;
  botProfile: BotProfile;
  requestId: string;
}

export interface AIWorkerResponse {
  type: "result";
  result: SearchResult;
  requestId: string;
}

export interface AIWorkerError {
  type: "error";
  error: string;
  requestId: string;
}

self.onmessage = (event: MessageEvent<AIWorkerRequest>) => {
  const { gameState, botProfile, requestId } = event.data;

  try {
    const result = findBestAction(gameState, botProfile);
    self.postMessage({
      type: "result",
      result,
      requestId,
    } satisfies AIWorkerResponse);
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : "AI computation failed",
      requestId,
    } satisfies AIWorkerError);
  }
};
