import { PieceType, PlayerColor, Board, Move } from "../types/types"

/**
 * Convers chess related algebraic notation [letter+number] to [x, y] coordinates
 * @param letterNumber algebraic notation [letter+number] string
 * @returns [x, y] coordinates
 */
export function lnToCoordinates(letterNumber: string): [number, number] {
	const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
	const x = letters.indexOf(letterNumber[0])
	const y = 8 - parseInt(letterNumber[1])
	return [x, y]
}

/**
 * Convers [x, y] coordinates to chess related algebraic notation [letter+number]
 * @param coordinate [x, y] coordinates
 * @returns algebraic notation [letter+number] string
 */
export function coordinateToLN(coordinate: [number, number]): string {
	const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
	const x = letters[coordinate[0]]
	const y = 8 - coordinate[1]
	return `${x}${y}`
}

/**
 * @param piece piece name string
 * @returns piece type
 */
export function getPieceType(piece: string | null): PieceType {
	if (!piece) return PieceType.INVALID_TYPE
	switch (piece[0]) {
		case "p":
			return PieceType.PAWN
		case "r":
			return PieceType.ROOK
		case "n":
			return PieceType.KNIGHT
		case "b":
			return PieceType.BISHOP
		case "q":
			return PieceType.QUEEN
		case "k":
			return PieceType.KING
		default:
			return PieceType.INVALID_TYPE
	}
}

/**
 * @param piece piece name string
 * @returns piece color
 */
export function getPieceColor(piece: string | null): PlayerColor {
	if (!piece) return PlayerColor.INVALID_COLOR
	switch (piece[1]) {
		case "w":
			return PlayerColor.WHITE
		case "b":
			return PlayerColor.BLACK
		default:
			return PlayerColor.INVALID_COLOR
	}
}

/**
 * Convers the color to opposite
 * @param playerColor the color to convers
 * @returns the opposite color
 */
export function oppositeColor(playerColor: PlayerColor): PlayerColor {
	switch (playerColor) {
		case PlayerColor.WHITE:
			return PlayerColor.BLACK
		case PlayerColor.BLACK:
			return PlayerColor.WHITE
		default:
			return PlayerColor.INVALID_COLOR
	}
}

/**
 * Finds the piece at coordinate
 * @param coordinate the coordinate to find at
 * @param board the board to search on
 * @returns "[piece type] + [piece color]" string
 */
export function getPieceAt(coordinate: string, board: Board): string | null {
	const [x, y] = lnToCoordinates(coordinate)
	const piece: string | null = !board[y] ? null : !board[y][x] ? null : board[y][x]
	return piece
}

/**
 * @returns a fen board as a string[][]
 */
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

/**
 * @param board the current board
 * @param move the move to be checked
 * @returns a list of valid moves for the piece at the from coordinate
 */
export function immitateTestBoardAfterMove(board: Board, move: Move): Board {
	const [fromX, fromY] = lnToCoordinates(move.from)
	const [toX, toY] = lnToCoordinates(move.to)
	const newBoard: Board = board.map((row) => row.slice())
	const piece = move.promotion ? move.promotion : board[fromY][fromX]
	newBoard[toY][toX] = piece
	newBoard[fromY][fromX] = null
	return newBoard
}

export function immitateFinalBoardAfterMove(board: Board, move: Move): Board {
	const from = lnToCoordinates(move.from)
	const to = lnToCoordinates(move.to)
	if (!from || !to) {
		console.error("Invalid move coordinates")
		return initialBoardSetup()
	}
	const [fromX, fromY] = from
	const [toX, toY] = to
	const newBoard: Board = board.map((row) => row.slice())
	const piece = move.promotion ? move.promotion : board[fromY][fromX]

	newBoard[toY][toX] = piece
	newBoard[fromY][fromX] = null

	if (piece && getPieceType(piece) === PieceType.KING) {
		let rookFrom: [number, number] | undefined
		let rookTo: [number, number] | undefined
		if (move.from === "e1") {
			if (move.to === "g1") {
				rookFrom = lnToCoordinates("h1")
				rookTo = lnToCoordinates("f1")
			} else if (move.to === "c1") {
				rookFrom = lnToCoordinates("a1")
				rookTo = lnToCoordinates("d1")
			}
		} else if (move.from === "e8") {
			if (move.to === "g8") {
				rookFrom = lnToCoordinates("h8")
				rookTo = lnToCoordinates("f8")
			} else if (move.to === "c8") {
				rookFrom = lnToCoordinates("a8")
				rookTo = lnToCoordinates("d8")
			}
		}
		if (rookFrom && rookTo) {
			const [rookFromX, rookFromY] = rookFrom
			const [rookToX, rookToY] = rookTo

			const rook = board[rookFromY][rookFromX]

			newBoard[rookToY][rookToX] = rook
			newBoard[rookFromY][rookFromX] = null
		}
	}
	return newBoard
}

/**
 * @param color the color to find the king position for
 * @param board the current board
 * @returns the algebraic notation [letter+number] of the king's position
 */
export function getKingPosition(color: PlayerColor, board: Board): string | undefined {
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (piece && getPieceType(piece) === PieceType.KING && getPieceColor(piece) === color) {
				return coordinateToLN([x, y])
			}
		}
	}
}
