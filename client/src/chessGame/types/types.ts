export enum ChessServerEvent {
	INIT_CONNECTION = "init-connection",
	START_GAME = "start-game",
	MAKE_MOVE = "make-move",
	RESIGN = "resign",
	OFFER_DRAW = "offer-draw",
	ACCEPT_DRAW = "accept-draw",
	DENY_DRAW = "deny-draw",
}

export enum ChessClientEvent {
	GAME_RECONNECT = "game-reconnect",
	CONNECTED = "connected",
	WAITING = "waiting",
	GAME_START = "game-start",
	MOVE_MADE = "move-made",
	OPPONENT_RESIGNED = "opponent-resigned",
	DRAW_OFFERED = "draw-offered",
	DRAW_ACCEPTED = "draw-accepted",
	DRAW_DENIED = "draw-denied",
	GAME_OVER = "game-over",
}

export enum GameState {
	WAITING = "waiting",
	STARTED = "started",
	WHITE_WIN = "white-win",
	BLACK_WIN = "black-win",
	DRAW = "draw",
	INVALID_STATE = "invalid-state",
}

export enum PieceType {
	PAWN = "p",
	ROOK = "r",
	KNIGHT = "n",
	BISHOP = "b",
	QUEEN = "q",
	KING = "k",
	INVALID_TYPE = "invalid-type",
}

export enum PlayerColor {
	WHITE = "w",
	BLACK = "b",
	INVALID_COLOR = "invalid-color",
}

export interface Game {
	id: string
	white: string
	black: string
	moves: Move[]
	state: GameState
}

export interface ProfileGame {
	id: string
	me: string
	myColor: PlayerColor
	opponent: string
	opponentColor: PlayerColor
	result: GameResult
}

export interface Move {
	from: string
	to: string
	promotion?: string
}

export interface MoveWrapper extends Move {
	turn: PlayerColor
	piece: PieceType
}

export enum GameResult {
	WIN = "win",
	LOSS = "loss",
	DRAW = "draw",
	INVALID_RESULT = "invalid-result",
}

export type Board = (string | null)[][]
