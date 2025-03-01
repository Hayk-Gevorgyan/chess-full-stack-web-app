import { useQuery } from "@apollo/client"
import { ENDED_GAME_QUERY } from "../queries"
import { EndedGamePayload, EndedGameVariables } from "../apolloTypes"
import { GameState } from "../../../chessGame/types/types"

const useEndedChessGame = ({ id }: { id: string }) => {
	const { loading, error, data } = useQuery<EndedGamePayload, EndedGameVariables>(ENDED_GAME_QUERY, { variables: { id } })

	if (loading) console.log("Loading ended game")
	if (error) console.error(`Error loading ended game: ${error.message}`)

	const game = data?.endedGame

	return game
		? game
		: {
				id: "null",
				white: "username",
				black: "opponent",
				state: GameState.INVALID_STATE,
				moves: [],
		  }
}

export default useEndedChessGame
