// GamesList.tsx
import { useQuery } from "@apollo/client"
import { ENDED_GAMES_QUERY } from "../../apollo/profile/queries"
import { GetEndedGamesPayload, GetProfileVariables } from "../../apollo/profile/apolloTypes"
import { GameResult, GameState, PlayerColor, ProfileGame } from "../../chessGame/types/types"
import GameCell from "./GameCell"

interface GamesListProps {
	username: string
}

export default function GamesList({ username }: GamesListProps) {
	const { loading, error, data } = useQuery<GetEndedGamesPayload, GetProfileVariables>(ENDED_GAMES_QUERY, {
		variables: { username },
		fetchPolicy: "network-only",
	})

	if (loading) return <div>Loading games...</div>
	if (error) return <div>Error loading games: {error.message}</div>

	const games: ProfileGame[] = data!.endedGames.map((game) => {
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
	})

	return (
		<div className="games-list">
			<h2>Game Results</h2>
			<div className="games-list-content">
				{games.map((game) => (
					<GameCell
						key={game.id}
						me={game.me}
						myColor={game.myColor}
						opponent={game.opponent}
						opponentColor={game.opponentColor}
						result={game.result}
					/>
				))}
			</div>
		</div>
	)
}
