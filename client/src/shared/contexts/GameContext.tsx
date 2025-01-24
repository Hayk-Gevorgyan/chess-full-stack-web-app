import { createContext } from "react"
import { ChessClientEvent, Color, GameState, Move } from "../../game/types/types"

export interface ChessWebSocketMessage {
	event: ChessClientEvent
	data?: any
}

export interface GameContextProps {
	id: string | undefined
	me: string
	myColor: Color
	opponent: string
	opponentColor: Color
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
