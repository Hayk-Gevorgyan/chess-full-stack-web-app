// GameCell.tsx
import { GameResult, PlayerColor } from "../../chessGame/types/types"

interface GameCellProps {
	me: string
	myColor: PlayerColor
	opponent: string
	opponentColor: PlayerColor
	result: GameResult
}

export default function GameCell({ me, myColor, opponent, opponentColor, result }: GameCellProps) {
	return (
		<div className="game-cell">
			<div className={`game-cell-block-${myColor}`}>
				<div className="game-cell-block-content">{me}</div>
			</div>
			<div className={`game-cell-block-${opponentColor}`}>
				<div className="game-cell-block-content">{opponent}</div>
			</div>
			<div className={`game-cell-block result-${result}`}>
				<div className="game-cell-block-content">{result.toUpperCase()}</div>
			</div>
		</div>
	)
}
