import { Game } from "../../chessGame/types/types"

export interface EndedGamePayload {
	endedGame: Game
}

export interface EndedGameVariables {
	id: string
}
