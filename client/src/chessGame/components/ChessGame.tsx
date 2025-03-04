import classNames from "classnames"
import ChessBoard from "./ChessBoard"
import { PlayerColor } from "../types/types"
import NumbersPanel from "./NumbersPanel"
import LettersPanel from "./LettersPanel"
import ChessGameSidePanel from "./ChessGameSidePanel"
import "../styles/ChessGame.css"
import PlayerBlock from "./PlayerBlock"
import { useChessGame } from "../hooks/useChessGame"
import PromotionPanel from "./PromotionPanel"
import { useGameContext } from "../../shared/hooks/useGameContext"

const ChessGame = () => {
	const {
		board,
		turn,
		promotionInfo,
		isBoardFlipped,
		pieceMoves,
		selectedSquare,
		checkedSquare,
		handlePromotionSelect,
		handleSquareClick,
		handleDragStart,
		handleDrop,
	} = useChessGame()

	const { me, myColor, opponent, opponentColor } = useGameContext()
	const chessBoardClassName = classNames("chessboard-container", {
		flipped: isBoardFlipped,
	})

	return (
		<div className="chess-game-container">
			{opponent && opponentColor ? (
				<PlayerBlock color={opponentColor} username={opponent} />
			) : (
				<PlayerBlock color={PlayerColor.BLACK} username="waiting..." />
			)}
			<div className={chessBoardClassName}>
				<NumbersPanel />
				<div className="board-letter-panel-filler-promotion-panel">
					<div className="board-and-letter-panel-column">
						<ChessBoard
							board={board as string[][]}
							selectedSquare={selectedSquare}
							checkedSquare={checkedSquare}
							validMoves={pieceMoves}
							onClick={handleSquareClick}
							onDragStart={handleDragStart}
							onDrop={handleDrop}
						/>
						<LettersPanel />
					</div>
					{promotionInfo && <PromotionPanel promotionInfo={promotionInfo} onSelect={handlePromotionSelect} />}
				</div>
				<ChessGameSidePanel turn={turn} />
			</div>
			{me && myColor ? (
				<PlayerBlock color={myColor} username={me} />
			) : (
				<PlayerBlock color={PlayerColor.WHITE} username={"username"} />
			)}
		</div>
	)
}

export default ChessGame
