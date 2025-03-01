import { Board, Move, PieceType, PlayerColor } from "../../types/types"

export function initialBoardSetup(): Board {
	const newBoard: (string | null)[][] = Array(8)
		.fill(null)
		.map(() => Array(8).fill(null))
	newBoard[0] = ["rb", "nb", "bb", "qb", "kb", "bb", "nb", "rb"]
	newBoard[1] = Array(8).fill("pb")
	newBoard[6] = Array(8).fill("pw")
	newBoard[7] = ["rw", "nw", "bw", "qw", "kw", "bw", "nw", "rw"]
	return newBoard
}

export function boardAfterMoves(moves: Move[]): Board {
	let derivedBoard: Board = initialBoardSetup()
	moves.forEach((move) => {
		derivedBoard = immitateFinalBoardAfterMove(derivedBoard, move)
	})
	return derivedBoard
}

export function immitateTestBoardAfterMove(board: Board, move: Move): Board {
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

export function lnToCoordinates(letterNumber: string): [number, number] | undefined {
	const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
	const x = letters.indexOf(letterNumber[0])
	const y = 8 - parseInt(letterNumber[1])
	if (x === -1 || y < 0 || y > 8) return undefined
	return [x, y]
}

export function coordinateToLN(coordinate: [number, number]): string | undefined {
	const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
	const x = letters[coordinate[0]]
	const number = Number(coordinate[1])
	if (!x || number > 8 || number < 0) return undefined
	const y = 8 - number
	return `${x}${y}`
}

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
export function getPieceType(piece: string | undefined): PieceType {
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

export function getPieceColor(piece: string | null | undefined): PlayerColor {
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

export function getTurn(movesLength: number): PlayerColor {
	return movesLength % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK
}
