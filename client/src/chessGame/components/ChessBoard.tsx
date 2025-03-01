import Piece from "./Piece"
import Square from "./Square"
import { Move } from "../types/types"

interface ChessBoardProps {
	board: Array<Array<string>>
	selectedSquare?: string
	checkedSquare?: string
	validMoves?: Move[]
	onClick?: (coordinate: string) => void
	onDragStart?: (coordinate: string) => void
	onDrop?: (coordinate: string) => void
}

const ChessBoard = ({ board, selectedSquare, checkedSquare, validMoves, onClick, onDragStart, onDrop }: ChessBoardProps) => {
	function isPieceMove(coordinate: string): boolean {
		if (!selectedSquare) return false
		return validMoves ? validMoves.some((m) => m.from === selectedSquare && m.to === coordinate) : false
	}
	function renderBoard() {
		const squares: JSX.Element[] = []
		for (let number = 8; number >= 1; number--) {
			for (let letterIndex = 0; letterIndex < 8; letterIndex++) {
				const letter = "abcdefgh"[letterIndex]
				const piece = board[8 - number]?.[letterIndex]
				squares.push(renderSquare(piece, letter, number))
			}
		}
		return <div className="chessboard">{squares}</div>
	}
	function renderSquare(pieceType: string, letter: string, number: number) {
		const coordinate: string = letter + number
		const isSelected: boolean = pieceType && selectedSquare && selectedSquare === coordinate ? true : false
		const isAttacked: boolean = pieceType && checkedSquare && checkedSquare === coordinate ? true : false
		const isValidMove: boolean = isPieceMove(coordinate)
		const piece = pieceType ? (
			<Piece type={pieceType} coordinate={coordinate} onDragStart={onDragStart ? onDragStart : () => {}} />
		) : undefined
		return (
			<Square
				key={`${letter}${number}`}
				letter={letter}
				number={number}
				onClick={onClick ? () => onClick(coordinate) : () => {}}
				onDrop={onDrop ? () => onDrop(coordinate) : () => {}}
				onDragOver={(e) => e.preventDefault()}
				isSelected={isSelected}
				isValidMove={isValidMove}
				isAttacked={isAttacked}
			>
				{piece}
			</Square>
		)
	}

	return renderBoard()
}

export default ChessBoard
