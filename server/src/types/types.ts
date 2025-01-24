export interface User {
	id: number
	username: string
	password: string
}

export interface GameWithBoard {
	id: string
	state: GameState
	white: string
	black: string
	board: Board
	moves: Move[]
}
export interface Game {
	id: string
	state: GameState
	drawOffer?: string
	white: string
	black: string
	moves: Move[]
}

export interface Move {
	from: string
	to: string
	promotion?: string
}

export type Board = (string | null)[][]

export enum GameState {
	WAITING = "waiting",
	STARTED = "started",
	WHITE_WIN = "white-win",
	BLACK_WIN = "black-win",
	DRAW = "draw",
	INVALID_STATE = "invalid-state",
}

export enum PlayerColor {
	WHITE = "w",
	BLACK = "b",
	INVALID_COLOR = "invalid-color",
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
