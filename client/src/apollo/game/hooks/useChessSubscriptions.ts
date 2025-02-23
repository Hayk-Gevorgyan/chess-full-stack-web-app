import { useSubscription } from "@apollo/client"
import { Game } from "../../../chessGame/types/types"
import { GAME_UPDATED_SUBSCRIPTION } from "../queries"
// import { GameUpdatedData } from "../../../shared/providers/GameProvider"

export interface GameUpdatedResponse {
	gameUpdated: Game
}

export interface GameUpdatedVariables {
	id: string
	username: string
}

const useChessSubscriptions = (id: string, username: string) => {
	const {
		data: gameUpdatedData,
		loading: gameUpdatedLoading,
		error: gameUpdatedError,
	} = useSubscription<GameUpdatedResponse, GameUpdatedVariables>(GAME_UPDATED_SUBSCRIPTION, {
		variables: { id, username },
	})

	return {
		gameUpdatedData,
		gameUpdatedLoading,
		gameUpdatedError,
	}
}

export default useChessSubscriptions
