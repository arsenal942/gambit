import type { GameState, GameAction, Player } from "@gambit/engine";

// ── Room / Player types ──────────────────────────────────────────────

export type RoomStatus = "waiting" | "playing" | "ended";

export interface PlayerInfo {
  socketId: string;
  playerToken: string;
  color: Player;
  connected: boolean;
  disconnectedAt: number | null;
}

export interface GameRoom {
  id: string;
  status: RoomStatus;
  gameState: GameState;
  players: {
    white: PlayerInfo | null;
    black: PlayerInfo | null;
  };
  createdAt: number;
  pendingDrawOffer: Player | null;
  disconnectTimers: Map<Player, ReturnType<typeof setTimeout>>;
}

// ── Client → Server events ───────────────────────────────────────────

export interface CreateGamePayload {
  preferredColor?: Player;
}

export interface JoinGamePayload {
  gameId: string;
  playerToken?: string;
}

export interface MakeMovePayload {
  gameId: string;
  playerToken: string;
  action: GameAction;
}

export interface ForfeitPayload {
  gameId: string;
  playerToken: string;
}

export interface OfferDrawPayload {
  gameId: string;
  playerToken: string;
}

export interface AcceptDrawPayload {
  gameId: string;
  playerToken: string;
}

export interface DeclineDrawPayload {
  gameId: string;
  playerToken: string;
}

export interface ClientToServerEvents {
  create_game: (
    payload: CreateGamePayload,
    callback: (response: GameCreatedResponse) => void,
  ) => void;
  join_game: (
    payload: JoinGamePayload,
    callback: (response: JoinGameResponse) => void,
  ) => void;
  make_move: (payload: MakeMovePayload) => void;
  forfeit: (payload: ForfeitPayload) => void;
  offer_draw: (payload: OfferDrawPayload) => void;
  accept_draw: (payload: AcceptDrawPayload) => void;
  decline_draw: (payload: DeclineDrawPayload) => void;
}

// ── Server → Client events ───────────────────────────────────────────

export interface GameCreatedResponse {
  success: boolean;
  gameId?: string;
  playerToken?: string;
  color?: Player;
  error?: string;
}

export interface JoinGameResponse {
  success: boolean;
  color?: Player;
  playerToken?: string;
  gameState?: GameState;
  roomStatus?: RoomStatus;
  error?: string;
}

export interface GameUpdatedPayload {
  gameState: GameState;
  lastAction?: GameAction;
}

export interface MoveRejectedPayload {
  reason: string;
}

export interface GameOverPayload {
  gameState: GameState;
  winner: Player | null;
  winCondition: string | null;
}

export interface OpponentDisconnectedPayload {
  gracePeriodMs: number;
}

export interface DrawOfferedPayload {
  offeredBy: Player;
}

export interface DrawDeclinedPayload {
  declinedBy: Player;
}

export interface ServerToClientEvents {
  game_started: (payload: { gameState: GameState }) => void;
  game_updated: (payload: GameUpdatedPayload) => void;
  move_rejected: (payload: MoveRejectedPayload) => void;
  game_over: (payload: GameOverPayload) => void;
  opponent_disconnected: (payload: OpponentDisconnectedPayload) => void;
  opponent_reconnected: () => void;
  draw_offered: (payload: DrawOfferedPayload) => void;
  draw_declined: (payload: DrawDeclinedPayload) => void;
  error: (payload: { message: string }) => void;
}
