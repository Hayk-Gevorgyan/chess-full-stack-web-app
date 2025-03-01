import { useCallback, useMemo, useState } from "react"
import useEndedChessGame from "../../apollo/endedChessGame/hooks/useEndedChessGame"
import { immitateFinalBoardAfterMove, initialBoardSetup } from "../../chessGame/chessValidation/helperFunctions"
import ChessBoard from "../../chessGame/components/ChessBoard"
import LettersPanel from "../../chessGame/components/LettersPanel"
import NumbersPanel from "../../chessGame/components/NumbersPanel"
import PlayerBlock from "../../chessGame/components/PlayerBlock"
import { Board, Game, PlayerColor } from "../../chessGame/types/types"
import EndedChessGameSidePanel from "./EndedChessGameSidePanel"

const EndedChessGame = ({ id }: { id: string }) => {
	const game: Game = useEndedChessGame({ id })
	const [moveIndex, setMoveIndex] = useState<number>(0)
	const board = useMemo<Board>(() => {
		let derivedBoard: Board = initialBoardSetup()
		for (let i = 0; i < moveIndex; i++) {
			derivedBoard = immitateFinalBoardAfterMove(derivedBoard, game.moves[i])
		}
		return derivedBoard
	}, [moveIndex, game.moves])
	const turn = useMemo<PlayerColor>(() => (moveIndex % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK), [moveIndex])

	const handleNextMove = useCallback(() => {
		if (moveIndex === game.moves.length) return
		else {
			setMoveIndex((prev) => prev + 1)
		}
	}, [moveIndex, setMoveIndex, game.moves])

	const handlePreviousMove = useCallback(() => {
		if (moveIndex === 0) return
		else {
			setMoveIndex((prev) => prev - 1)
		}
	}, [moveIndex, setMoveIndex])
	return (
		<div className="chess-game-container">
			<PlayerBlock color={PlayerColor.BLACK} username={game.black} />
			<div className="chessboard-container">
				<NumbersPanel />
				<div className="board-letter-panel-filler-promotion-panel">
					<div className="board-and-letter-panel-column">
						<ChessBoard board={board as string[][]} />
						<LettersPanel />
					</div>
				</div>
				<EndedChessGameSidePanel onNextMove={handleNextMove} onPreviousMove={handlePreviousMove} turn={turn} />
			</div>
			<PlayerBlock color={PlayerColor.WHITE} username={game.white} />
		</div>
	)
}

export default EndedChessGame
