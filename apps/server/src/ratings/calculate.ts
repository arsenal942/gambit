import rate from "glicko2-lite";

export interface PlayerRating {
  rating: number;
  rd: number;
  volatility: number;
  gamesPlayed: number;
}

export interface RatingUpdate {
  before: PlayerRating;
  after: PlayerRating;
}

export interface GameRatingResult {
  white: RatingUpdate;
  black: RatingUpdate;
}

export const DEFAULT_RATING: PlayerRating = {
  rating: 1200,
  rd: 350,
  volatility: 0.06,
  gamesPlayed: 0,
};

const PROVISIONAL_THRESHOLD = 20;
const GLICKO2_OPTIONS = { rating: 1200 };

export function isProvisional(gamesPlayed: number): boolean {
  return gamesPlayed < PROVISIONAL_THRESHOLD;
}

/**
 * Calculate new Glicko-2 ratings after a game.
 * @param score 1 = white wins, 0 = black wins, 0.5 = draw
 */
export function calculateRatings(
  white: PlayerRating,
  black: PlayerRating,
  score: number,
): GameRatingResult {
  // glicko2-lite Opponent tuple: [rating, rd, score]
  // (the type says "vol" but the implementation uses it as score)
  const whiteResult = rate(
    white.rating,
    white.rd,
    white.volatility,
    [[black.rating, black.rd, score]],
    GLICKO2_OPTIONS,
  );

  const blackResult = rate(
    black.rating,
    black.rd,
    black.volatility,
    [[white.rating, white.rd, 1 - score]],
    GLICKO2_OPTIONS,
  );

  return {
    white: {
      before: white,
      after: {
        rating: whiteResult.rating,
        rd: whiteResult.rd,
        volatility: whiteResult.vol,
        gamesPlayed: white.gamesPlayed + 1,
      },
    },
    black: {
      before: black,
      after: {
        rating: blackResult.rating,
        rd: blackResult.rd,
        volatility: blackResult.vol,
        gamesPlayed: black.gamesPlayed + 1,
      },
    },
  };
}
