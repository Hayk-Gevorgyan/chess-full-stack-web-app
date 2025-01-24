import { Move, Color, Piece, Board, MoveWrapper } from "../types/types"
import { lnToCoordinates, coordinateToLN, getPieceType, getPieceColor, oppositeColor } from "../utils/helperFunctions"

export function isValidMove(board: Board, move: Move) {
	const [fromX, fromY] = lnToCoordinates(move.from)
	const piece = board[fromY][fromX]
	if (!piece) return false
	const turn: Color = piece[0] === Color.WHITE ? Color.WHITE : Color.BLACK

	const turnMoves: Move[] = getTurnMoves(turn, board)
	return turnMoves.find((m) => move.from === m.from && move.to === m.to)
}
export function getTurnMoves(turn: Color, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []
	//collect all not blocked moves and captures
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (!piece || getPieceColor(piece) !== turn) continue

			const pieceType: Piece = getPieceType(piece)
			switch (pieceType) {
				case Piece.PAWN:
					moves.push(...getPawnMoves(x, y, turn, board))
					break
				case Piece.ROOK:
					moves.push(...getRookMoves(x, y, turn, board))
					break
				case Piece.KNIGHT:
					moves.push(...getKnightMoves(x, y, turn, board))
					break
				case Piece.BISHOP:
					moves.push(...getBishopMoves(x, y, turn, board))
					break
				case Piece.QUEEN:
					moves.push(...getQueenMoves(x, y, turn, board))
					break
				case Piece.KING:
					moves.push(...getKingMoves(x, y, turn, board))
					break
				default:
					continue
			}
		}
	}

	//return moves after which check doesnt occure to own king
	const movesToReturn = moves.filter((m) => {
		const newBoard = immitateBoardAfterMove(board, m)
		const isInCheck = isCheck(turn, newBoard)
		return !isInCheck
	})

	return movesToReturn
}
function getPawnMoves(fromX: number, fromY: number, playerColor: Color, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const direction = playerColor === Color.WHITE ? -1 : 1
	const startRow = playerColor === Color.WHITE ? 6 : 1
	const opponentColor = oppositeColor(playerColor)
	let toSquare: string | null = null
	let toX: number | null = null
	let toY: number | null = null

	toX = fromX
	toY = fromY + direction
	toSquare = board[toY][toX]
	if (!toSquare) {
		moves.push({
			turn: playerColor,
			piece: Piece.PAWN,
			from: coordinateToLN([fromX, fromY]),
			to: coordinateToLN([toX, toY]),
		})
		if (fromY === startRow && !board[fromY + 2 * direction][fromX]) {
			moves.push({
				turn: playerColor,
				piece: Piece.PAWN,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX, fromY + 2 * direction]),
			})
		}
	}
	toSquare = board[fromY + direction][fromX + 1]
	if (toSquare && getPieceColor(toSquare) === opponentColor) {
		moves.push({
			turn: playerColor,
			piece: Piece.PAWN,
			from: coordinateToLN([fromX, fromY]),
			to: coordinateToLN([fromX + 1, fromY + direction]),
		})
	}
	toSquare = board[fromY + direction][fromX - 1]
	if (toSquare && getPieceColor(toSquare) === opponentColor) {
		moves.push({
			turn: playerColor,
			piece: Piece.PAWN,
			from: coordinateToLN([fromX, fromY]),
			to: coordinateToLN([fromX - 1, fromY + direction]),
		})
	}

	return moves
}
function getRookMoves(fromX: number, fromY: number, playerColor: Color, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const opponentColor: Color = oppositeColor(playerColor)
	let toSquare: string | null = null
	//right
	for (let i = fromX + 1; i < 8; i++) {
		toSquare = board[fromY][i]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: Piece.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([i, fromY]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: Piece.ROOK,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([i, fromY]),
				})
			break
		}
	}

	//left
	for (let i = fromX - 1; i >= 0; i--) {
		toSquare = board[fromY][i]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: Piece.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([i, fromY]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: Piece.ROOK,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([i, fromY]),
				})
			break
		}
	}

	//down
	for (let i = fromY + 1; i < 8; i++) {
		toSquare = board[i][fromX]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: Piece.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX, i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: Piece.ROOK,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([fromX, i]),
				})
			break
		}
	}

	//up
	for (let i = fromY - 1; i >= 0; i--) {
		toSquare = board[i][fromX]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: Piece.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX, i]),
			})
		} else if (getPieceColor(toSquare) === opponentColor) {
			moves.push({
				turn: playerColor,
				piece: Piece.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX, i]),
			})
			break
		} else {
			break
		}
	}

	return moves
}
function getKnightMoves(fromX: number, fromY: number, playerColor: Color, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const movesTo: [number, number][] = []

	movesTo.push([fromX - 2, fromY + 1])
	movesTo.push([fromX - 2, fromY - 1])
	movesTo.push([fromX - 1, fromY - 2])
	movesTo.push([fromX + 1, fromY - 2])
	movesTo.push([fromX + 2, fromY - 1])
	movesTo.push([fromX + 2, fromY + 1])
	movesTo.push([fromX + 1, fromY + 2])
	movesTo.push([fromX - 1, fromY + 2])
	movesTo.forEach(([x, y]) => {
		if (x >= 0 && x < 8 && y >= 0 && y < 8) {
			const toSquare = board[y][x]
			if (toSquare === null || (toSquare !== null && getPieceColor(toSquare) === oppositeColor(playerColor))) {
				moves.push({
					turn: playerColor,
					piece: Piece.KNIGHT,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([x, y]),
				})
			}
		}
	})

	return moves
}
function getBishopMoves(fromX: number, fromY: number, playerColor: Color, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const opponentColor: Color = oppositeColor(playerColor)
	let toSquare: string | null = null

	//up right
	for (let i = 1; fromX + i < 8 && fromY + i < 8; i++) {
		toSquare = board[fromY + i][fromX + i]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: Piece.BISHOP,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX + i, fromY + i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: Piece.BISHOP,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([fromX + i, fromY + i]),
				})
			break
		}
	}

	//up left
	for (let i = 1; fromX - i >= 0 && fromY + i < 8; i++) {
		toSquare = board[fromY + i][fromX - i]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: Piece.BISHOP,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX - i, fromY + i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: Piece.BISHOP,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([fromX - i, fromY + i]),
				})
			break
		}
	}

	//down right
	for (let i = 1; fromX + i < 8 && fromY - i >= 0; i++) {
		toSquare = board[fromY - i][fromX + i]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: Piece.BISHOP,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX + i, fromY - i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: Piece.BISHOP,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([fromX + i, fromY - i]),
				})
			break
		}
	}

	//down left
	for (let i = 1; fromX - i >= 0 && fromY - i >= 0; i++) {
		toSquare = board[fromY - i][fromX - i]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: Piece.BISHOP,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX - i, fromY - i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: Piece.BISHOP,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([fromX - i, fromY - i]),
				})
			break
		}
	}

	return moves
}
function getQueenMoves(fromX: number, fromY: number, playerColor: Color, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	moves.push(...getRookMoves(fromX, fromY, playerColor, board))
	moves.push(...getBishopMoves(fromX, fromY, playerColor, board))

	moves.forEach((move) => (move.piece = Piece.QUEEN))

	return moves
}
function getKingMoves(fromX: number, fromY: number, playerColor: Color, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const movesTo: [number, number][] = []
	movesTo.push([fromX + 1, fromY])
	movesTo.push([fromX - 1, fromY])
	movesTo.push([fromX, fromY + 1])
	movesTo.push([fromX, fromY - 1])
	movesTo.push([fromX + 1, fromY + 1])
	movesTo.push([fromX + 1, fromY - 1])
	movesTo.push([fromX - 1, fromY + 1])
	movesTo.push([fromX - 1, fromY - 1])
	movesTo.forEach(([x, y]) => {
		if (x >= 0 && x < 8 && y >= 0 && y < 8) {
			const toSquare = board[y][x]
			if (toSquare === null || (toSquare !== null && getPieceColor(toSquare) === oppositeColor(playerColor))) {
				moves.push({
					turn: playerColor,
					piece: Piece.KING,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([x, y]),
				})
			}
		}
	})

	return moves
}
export function immitateBoardAfterMove(board: Board, move: Move): Board {
	const [fromX, fromY] = lnToCoordinates(move.from)
	const [toX, toY] = lnToCoordinates(move.to)
	const newBoard: Board = board.map((row) => row.slice())
	const piece = move.promotion ? move.promotion : board[fromY][fromX]
	newBoard[toY][toX] = piece
	newBoard[fromY][fromX] = null
	return newBoard
}
export function isCheck(checkedColor: Color, board: Board): string | undefined {
	const checkedKingPosition = getKingPosition(checkedColor, board)
	const opponentColor = oppositeColor(checkedColor)

	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (!piece || getPieceColor(piece) !== opponentColor) continue
			const pieceType: Piece = getPieceType(piece)
			switch (pieceType) {
				case Piece.PAWN: {
					const pawnMoves = getPawnMoves(x, y, opponentColor, board)
					if (pawnMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}

				case Piece.ROOK: {
					const rookMoves = getRookMoves(x, y, opponentColor, board)
					if (rookMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				case Piece.KNIGHT: {
					const knightMoves = getKnightMoves(x, y, opponentColor, board)
					if (knightMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				case Piece.BISHOP: {
					const bishopMoves = getBishopMoves(x, y, opponentColor, board)
					if (bishopMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				case Piece.QUEEN: {
					const queenMoves = getQueenMoves(x, y, opponentColor, board)
					if (queenMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				case Piece.KING: {
					const kingMoves = getKingMoves(x, y, opponentColor, board)
					if (kingMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				default:
					return undefined
			}
		}
	}
}
function getKingPosition(color: Color, board: Board): string | undefined {
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (piece && getPieceType(piece) === Piece.KING && getPieceColor(piece) === color) {
				return coordinateToLN([x, y])
			}
		}
	}
}

export function isPromotion(move: MoveWrapper): boolean {
	const toCoordinates = lnToCoordinates(move.to)
	if (move.piece === Piece.PAWN && toCoordinates) {
		const toY = toCoordinates[1]
		const lastRow = move.turn === Color.WHITE ? 0 : 7

		console.log({ toY, lastRow })
		return toY === lastRow
	}
	console.log("no promotion at", move.to, toCoordinates, "for piece", move.piece)
	return false
}
