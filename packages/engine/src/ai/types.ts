import type { GameAction, Player } from "../types.js";

export interface EvaluationWeights {
  material: number;
  capturePointControl: number;
  centerControl: number;
  riverAdvancement: number;
  mobility: number;
  longshotThreats: number;
  pushbackAvailability: number;
  promotionPotential: number;
  backRowDefense: number;
  capturedPiecesValue: number;
  pawnStructure: number;
}

export interface SearchResult {
  action: GameAction;
  score: number;
  depth: number;
}

export interface BotProfile {
  id: string;
  name: string;
  rating: number;
  description: string;
  depth: number;
  useIterativeDeepening: boolean;
  useOpeningBook: boolean;
  timeLimitMs: number;
  randomness: number;
  evaluationWeights: EvaluationWeights;
  artificialDelayMs: [number, number];
}
