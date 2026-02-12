export type Player = "white" | "black";

export type UnitType = "footman" | "archer" | "knight";

export interface Position {
  col: number; // 1-10
  row: string; // A-K
}

export interface Piece {
  id: string;
  type: UnitType;
  player: Player;
  position: Position;
}

export type MoveType =
  | "move"
  | "capture"
  | "pushback"
  | "longshot"
  | "promotion"
  | "ransom";

export interface Move {
  piece: Piece;
  from: Position;
  to: Position;
  type: MoveType;
  capturedPiece?: Piece;
  promotedPiece?: Piece;
  ransomPiece?: Piece;
}

export type Board = (Piece | null)[][];

export const CAPTURE_POINT_POSITIONS: Position[] = [
  { col: 1, row: "F" },
  { col: 4, row: "F" },
  { col: 7, row: "F" },
  { col: 10, row: "F" },
];

export type CapturePointControl = Record<string, Player | null>;

export type RiverStatus = "behind" | "at" | "beyond";

export type GamePhase = "playing" | "ended";

export interface GameState {
  board: Board;
  turn: Player;
  moveHistory: Move[];
  capturedPieces: { white: Piece[]; black: Piece[] };
  capturePoints: CapturePointControl;
  checkPlayer: Player | null;
  lastPushback: { targetPieceId: string; byPlayer: Player } | null;
  turnsSinceCapture: number;
  gamePhase: GamePhase;
  winner: Player | null;
  winCondition: string | null;
}
