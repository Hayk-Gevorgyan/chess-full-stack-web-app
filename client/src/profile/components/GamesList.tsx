import { ProfileGame } from "../../chessGame/types/types"
import GameCell from "./GameCell"
import useEndedGames from "../../apollo/profile/hooks/useEndedGames"

interface GamesListProps {
	username: string
}

export default function GamesList({ username }: GamesListProps) {
	const games: ProfileGame[] = useEndedGames({ username })

	return (
		<div className="games-list">
			<h2>Game Results</h2>
			<div className="games-list-content">
				{games.map((game) => (
					<GameCell
						key={game.id}
						gameId={game.id}
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
