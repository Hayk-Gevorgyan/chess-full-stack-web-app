import { Move, Game } from "../../chessGame/types/types"

export interface StartGamePayload {
	startGame: { id: string; game: Game; token?: string }
}

export interface MakeMoveVariables {
	move: Move
}
