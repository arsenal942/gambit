export const TILE_SIZE = 60;
export const BOARD_COLS = 10;
export const BOARD_ROWS = 11;
export const BOARD_WIDTH = BOARD_COLS * TILE_SIZE;
export const BOARD_HEIGHT = BOARD_ROWS * TILE_SIZE;

export const ROWS = "ABCDEFGHIJK";

export const TILE_COLORS = {
  light: "#F5E6C8",
  dark: "#8B6914",
  riverLight: "#7BC4C4",
  riverDark: "#3D7A7A",
} as const;

export const PIECE_COLORS = {
  white: { fill: "#FAF0DC", stroke: "#3D2B1F" },
  black: { fill: "#2C1810", stroke: "#D4C5A9" },
} as const;

export const ACTION_COLORS = {
  move: "#3B82F6",
  capture: "#EF4444",
  pushback: "#F97316",
  longshot: "#A855F7",
} as const;

export const HIGHLIGHT_COLORS = {
  selected: "rgba(250, 204, 21, 0.4)",
  lastMoveFrom: "rgba(250, 204, 21, 0.25)",
  lastMoveTo: "rgba(250, 204, 21, 0.35)",
} as const;
