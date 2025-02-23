import { Piece, Color, Board } from "../types/types"

export function lnToCoordinates(letterNumber: string): [number, number] {
	const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
	const x = letters.indexOf(letterNumber[0])
	const y = 8 - parseInt(letterNumber[1])
	return [x, y]
}

export function coordinateToLN(coordinate: [number, number]): string {
	const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
	const x = letters[coordinate[0]]
	const y = 8 - coordinate[1]
	return `${x}${y}`
}

export function getPieceType(piece: string | null): Piece {
	if (!piece) return Piece.INVALID_TYPE
	switch (piece[0]) {
		case "p":
			return Piece.PAWN
		case "r":
			return Piece.ROOK
		case "n":
			return Piece.KNIGHT
		case "b":
			return Piece.BISHOP
		case "q":
			return Piece.QUEEN
		case "k":
			return Piece.KING
		default:
			return Piece.INVALID_TYPE
	}
}

export function getPieceColor(piece: string | null): Color {
	if (!piece) return Color.INVALID_COLOR
	switch (piece[1]) {
		case "w":
			return Color.WHITE
		case "b":
			return Color.BLACK
		default:
			console.log("default case", piece[1])
			return Color.INVALID_COLOR
	}
}

export function oppositeColor(playerColor: Color): Color {
	switch (playerColor) {
		case Color.WHITE:
			return Color.BLACK
		case Color.BLACK:
			return Color.WHITE
		default:
			return Color.INVALID_COLOR
	}
}

export function getPieceAt(coordinate: string, board: Board): string | null {
	const [x, y] = lnToCoordinates(coordinate)
	const piece: string | null = !board[y] ? null : !board[y][x] ? null : board[y][x]
	return piece
}

export function initialBoardSetup(): string[][] {
	const newBoard = Array(8)
		.fill(null)
		.map(() => Array(8).fill(null))
	newBoard[0] = ["rb", "nb", "bb", "qb", "kb", "bb", "nb", "rb"]
	newBoard[1] = Array(8).fill("pb")
	newBoard[6] = Array(8).fill("pw")
	newBoard[7] = ["rw", "nw", "bw", "qw", "kw", "bw", "nw", "rw"]
	return newBoard
}
