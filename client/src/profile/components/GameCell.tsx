// GameCell.tsx
import { GameResult, PlayerColor } from "../../chessGame/types/types"
import EndedGameLink from "../../shared/components/EndedGameLink"
import ProfileLink from "../../shared/components/ProfileLink"

interface GameCellProps {
	gameId: string
	me: string
	myColor: PlayerColor
	opponent: string
	opponentColor: PlayerColor
	result: GameResult
}

export default function GameCell({ me, myColor, opponent, opponentColor, result, gameId }: GameCellProps) {
	return (
		<div className="game-cell">
			<div className={`game-cell-block-${myColor}`}>
				<ProfileLink username={me} classNames="game-cell-block-content" />
			</div>
			<div className={`game-cell-block-${opponentColor}`}>
				<ProfileLink username={opponent} classNames="game-cell-block-content" />
			</div>
			<div className={`game-cell-block result-${result}`}>
				<EndedGameLink classNames="game-cell-block-content" result={result.toUpperCase()} id={gameId} />
			</div>
		</div>
	)
}
