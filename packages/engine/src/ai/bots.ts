import type { BotProfile, EvaluationWeights } from "./types.js";

const FULL_WEIGHTS: EvaluationWeights = {
  material: 1,
  capturePointControl: 1,
  centerControl: 1,
  riverAdvancement: 1,
  mobility: 1,
  longshotThreats: 1,
  pushbackAvailability: 1,
  promotionPotential: 1,
  backRowDefense: 1,
  capturedPiecesValue: 1,
  pawnStructure: 1,
};

export const BOT_PROFILES: Record<string, BotProfile> = {
  squire: {
    id: "squire",
    name: "Squire",
    rating: 600,
    description:
      "A fresh recruit still learning the basics. Perfect for your first game.",
    depth: 1,
    useIterativeDeepening: false,
    useOpeningBook: false,
    timeLimitMs: 500,
    randomness: 0.4,
    evaluationWeights: {
      material: 1,
      capturePointControl: 0,
      centerControl: 0,
      riverAdvancement: 0,
      mobility: 0,
      longshotThreats: 0,
      pushbackAvailability: 0,
      promotionPotential: 0,
      backRowDefense: 0,
      capturedPiecesValue: 0,
      pawnStructure: 0,
    },
    artificialDelayMs: [500, 1000],
  },
  soldier: {
    id: "soldier",
    name: "Soldier",
    rating: 900,
    description:
      "A trained fighter who knows the fundamentals. Can be caught off guard.",
    depth: 2,
    useIterativeDeepening: false,
    useOpeningBook: false,
    timeLimitMs: 1000,
    randomness: 0.2,
    evaluationWeights: {
      material: 1,
      capturePointControl: 0.5,
      centerControl: 0.3,
      riverAdvancement: 0.3,
      mobility: 0,
      longshotThreats: 0.3,
      pushbackAvailability: 0,
      promotionPotential: 0,
      backRowDefense: 0,
      capturedPiecesValue: 0.2,
      pawnStructure: 0,
    },
    artificialDelayMs: [750, 1500],
  },
  captain: {
    id: "captain",
    name: "Captain",
    rating: 1200,
    description:
      "A seasoned officer with solid tactics. Won't make obvious mistakes.",
    depth: 3,
    useIterativeDeepening: false,
    useOpeningBook: true,
    timeLimitMs: 2000,
    randomness: 0.05,
    evaluationWeights: {
      material: 1,
      capturePointControl: 0.8,
      centerControl: 0.7,
      riverAdvancement: 0.7,
      mobility: 0.5,
      longshotThreats: 0.7,
      pushbackAvailability: 0.5,
      promotionPotential: 0.6,
      backRowDefense: 0.5,
      capturedPiecesValue: 0.5,
      pawnStructure: 0.5,
    },
    artificialDelayMs: [1000, 2000],
  },
  commander: {
    id: "commander",
    name: "Commander",
    rating: 1500,
    description:
      "A battlefield veteran who plans several moves ahead. Bring your best.",
    depth: 4,
    useIterativeDeepening: true,
    useOpeningBook: true,
    timeLimitMs: 4000,
    randomness: 0.02,
    evaluationWeights: { ...FULL_WEIGHTS },
    artificialDelayMs: [1500, 3000],
  },
  warlord: {
    id: "warlord",
    name: "Warlord",
    rating: 1800,
    description:
      "A legendary strategist who exploits every weakness. Only the worthy survive.",
    depth: 5,
    useIterativeDeepening: true,
    useOpeningBook: true,
    timeLimitMs: 6000,
    randomness: 0,
    evaluationWeights: {
      ...FULL_WEIGHTS,
      capturePointControl: 1.3,
      longshotThreats: 1.2,
      mobility: 1.1,
    },
    artificialDelayMs: [2000, 4000],
  },
};

export function getBotProfile(id: string): BotProfile | undefined {
  return BOT_PROFILES[id];
}

export function getAllBotProfiles(): BotProfile[] {
  return Object.values(BOT_PROFILES);
}
