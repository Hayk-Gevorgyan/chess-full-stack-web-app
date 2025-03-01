import { useQuery } from "@apollo/client"
import { GetEndedGamesPayload, GetProfileVariables } from "../apolloTypes"
import { ENDED_GAMES_QUERY } from "../queries"
import { GameResult, GameState, PlayerColor, ProfileGame } from "../../../chessGame/types/types"

const useEndedGames = ({ username }: { username: string }): ProfileGame[] => {
	const { loading, error, data } = useQuery<GetEndedGamesPayload, GetProfileVariables>(ENDED_GAMES_QUERY, {
		variables: { username },
		fetchPolicy: "network-only",
	})

	if (loading) console.log("Loading games...")
	if (error) console.error(`Error loading games: ${error.message}`)

	const games: ProfileGame[] =
		data?.endedGames.map((game) => {
			let result: GameResult
			if (
				(game.state === GameState.WHITE_WIN && game.white === username) ||
				(game.state === GameState.BLACK_WIN && game.black === username)
			) {
				result = GameResult.WIN
			} else if (game.state === GameState.DRAW) {
				result = GameResult.DRAW
			} else {
				result = GameResult.LOSS
			}

			return {
				id: game.id,
				opponent: game.white === username ? game.black : game.white,
				me: username,
				myColor: game.white === username ? PlayerColor.WHITE : PlayerColor.BLACK,
				opponentColor: game.white === username ? PlayerColor.BLACK : PlayerColor.WHITE,
				result,
			}
		}) || []

	return games
}

export default useEndedGames
