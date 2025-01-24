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

export enum Piece {
	PAWN = "p",
	ROOK = "r",
	KNIGHT = "n",
	BISHOP = "b",
	QUEEN = "q",
	KING = "k",
	INVALID_TYPE = "invalid-type",
}

export enum Color {
	WHITE = "w",
	BLACK = "b",
	INVALID_COLOR = "invalid-color",
}

export interface Move {
	from: string
	to: string
	promotion?: string
}

export interface MoveWrapper extends Move {
	turn: Color
	piece: Piece
}

export type Board = (string | null)[][]
