import { Game, GameState, ProfileGame } from "../../chessGame/types/types"

export interface GetProfilePayload {
	profile: {
		username: string
		games: ProfileGame[]
	}
}

export interface GetProfileVariables {
	username: string
}

export interface GetEndedGamesPayload {
	endedGames: {
		id: string
		white: string
		black: string
		state: GameState
	}[]
}
