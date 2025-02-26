import { createContext } from "react"
import { ChessClientEvent, PlayerColor, GameState, Move } from "../../chessGame/types/types"

export interface ChessWebSocketMessage {
	event: ChessClientEvent
	data?: any
}

export interface GameContextProps {
	id: string | undefined
	me: string
	myColor: PlayerColor
	opponent: string
	opponentColor: PlayerColor
	moves: Move[]
	gameState: GameState
	opponentOfferedDraw: boolean
	startGame: () => void
	offerDraw: () => void
	acceptDraw: () => void
	denyDraw: () => void
	resign: () => void
	makeMove: (move: Move) => void
}

export const GameContext = createContext<GameContextProps | undefined>(undefined)
