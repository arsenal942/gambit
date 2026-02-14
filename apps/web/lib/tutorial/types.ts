import type { Position, GameState, GameAction, Player, Piece } from "@gambit/engine";

// ── Piece placement for board setup ────────────────────────────

export interface PiecePlacement {
  id: string;
  type: "footman" | "archer" | "knight";
  player: Player;
  position: Position;
  hasMoved?: boolean; // defaults to true
}

// ── Board setup for a tutorial step ────────────────────────────

export interface BoardSetup {
  pieces: PiecePlacement[];
  turn: Player;
  capturedPieces?: { white: PiecePlacement[]; black: PiecePlacement[] };
  capturePoints?: Record<string, Player | null>;
  lastPushback?: { targetPieceId: string; byPlayer: Player } | null;
}

// ── Expected action validation ────────────────────────────────

export type ExpectedAction =
  | { type: "exact"; action: GameAction }
  | { type: "any_of"; actions: GameAction[] }
  | { type: "move_type"; moveType: string }
  | { type: "piece_to_position"; pieceId: string; targetPosition: Position }
  | { type: "any" }; // accept any legal move

// ── Hint shown after a delay ──────────────────────────────────

export interface HintDef {
  delayMs: number;
  text: string;
  highlightPosition?: Position;
}

// ── Tile highlight for tutorial annotations ───────────────────

export interface TileHighlightDef {
  position: Position;
  color: string;
  label?: string;
}

// ── Annotation arrow drawn on the board ───────────────────────

export interface AnnotationArrow {
  from: Position;
  to: Position;
  color: string;
}

// ── Step types ────────────────────────────────────────────────

interface BaseStep {
  id: string;
  coachText: string;
}

export interface ObserveStep extends BaseStep {
  type: "observe";
  boardSetup: BoardSetup;
  highlights?: TileHighlightDef[];
  pieceHighlights?: string[]; // piece IDs to pulse
  arrows?: AnnotationArrow[];
}

export interface InteractStep extends BaseStep {
  type: "interact";
  boardSetup: BoardSetup;
  expectedAction?: ExpectedAction;
  wrongMoveText?: string; // shown on wrong move
  successText?: string;
  hints?: HintDef[];
  highlightPieces?: string[];
  allowedPieceIds?: string[]; // restrict which pieces can be selected
}

export interface FreePlayStep extends BaseStep {
  type: "freeplay";
  boardSetup: BoardSetup;
  objective: string;
  victoryCondition: (state: GameState) => boolean;
  maxMoves?: number;
  hints?: HintDef[];
}

export interface ScriptedStep extends BaseStep {
  type: "scripted";
  boardSetup: BoardSetup;
  action: GameAction; // auto-executed action to show
  afterText: string; // text shown after the action plays
}

export interface CompleteStep extends BaseStep {
  type: "complete";
  summaryPoints: string[];
}

export type TutorialStep =
  | ObserveStep
  | InteractStep
  | FreePlayStep
  | ScriptedStep
  | CompleteStep;

// ── Lesson and progress ───────────────────────────────────────

export interface TutorialLesson {
  id: string;
  number: number; // 1-8
  title: string;
  description: string;
  steps: TutorialStep[];
}

export interface TutorialProgress {
  completedLessons: string[];
  lastLesson: string | null;
}
