import { Move, Game } from "../../chessGame/types/types"

export interface StartGamePayload {
	startGame: { id: string; game: Game }
}

export interface MakeMoveVariables {
	move: Move
}
