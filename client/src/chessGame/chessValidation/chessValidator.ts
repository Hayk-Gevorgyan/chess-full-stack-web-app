import { Move, PlayerColor, PieceType, Board, MoveWrapper } from "../types/types"
import {
	lnToCoordinates,
	coordinateToLN,
	getPieceType,
	getPieceColor,
	oppositeColor,
	immitateTestBoardAfterMove,
	getKingPosition,
} from "./helperFunctions"

/**
 * Checks if the move is valid on the board
 * @param board the board to check on
 * @param move the move to check
 * @returns true if the move is valid on the board and false otherwise
 */
export function isValidMove(board: Board, move: Move): boolean {
	const [fromX, fromY] = lnToCoordinates(move.from)
	const piece = board[fromY][fromX]
	if (!piece) return false
	const turn: PlayerColor = piece[0] === PlayerColor.WHITE ? PlayerColor.WHITE : PlayerColor.BLACK

	const turnMoves: Move[] = getTurnMoves(turn, board)
	return turnMoves.some((m) => move.from === m.from && move.to === m.to)
}

/**
 * Gets available valid moves for the player whose turn is on the board
 * @param turn the turn of the player
 * @param board the board to check on
 * @returns a MoveWrapper array
 */
export function getTurnMoves(turn: PlayerColor, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []
	//collect all not blocked moves and captures
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (!piece || getPieceColor(piece) !== turn) continue

			const pieceType: PieceType = getPieceType(piece)
			switch (pieceType) {
				case PieceType.PAWN:
					moves.push(...getPawnMoves(x, y, turn, board))
					break
				case PieceType.ROOK:
					moves.push(...getRookMoves(x, y, turn, board))
					break
				case PieceType.KNIGHT:
					moves.push(...getKnightMoves(x, y, turn, board))
					break
				case PieceType.BISHOP:
					moves.push(...getBishopMoves(x, y, turn, board))
					break
				case PieceType.QUEEN:
					moves.push(...getQueenMoves(x, y, turn, board))
					break
				case PieceType.KING:
					moves.push(...getKingMoves(x, y, turn, board))
					break
				default:
					continue
			}
		}
	}

	//return moves after which check doesnt occure to own king
	const movesToReturn = moves.filter((m) => {
		const newBoard = immitateTestBoardAfterMove(board, m)
		const isInCheck = isCheck(turn, newBoard)
		return !isInCheck
	})

	return movesToReturn
}

/**
 * Calculates what moves could a pawn on fromX fromY do "not necessarily valid"
 * @param fromX x coordinate of the pawn
 * @param fromY y coordinate of the pawn
 * @param turn pawn color
 * @param board the board to check on
 * @returns a MoveWrapper array
 */
function getPawnMoves(fromX: number, fromY: number, turn: PlayerColor, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	if (fromX == null || fromY == null || !turn || !board) {
		return moves
	}

	const direction = turn === PlayerColor.WHITE ? -1 : 1
	const startRow = turn === PlayerColor.WHITE ? 6 : 1
	const opponentColor = oppositeColor(turn)
	let toSquare: string | null = null
	let toX: number | null = null
	let toY: number | null = null

	toX = fromX
	toY = fromY + direction
	toSquare = board[toY][toX]
	if (!toSquare) {
		moves.push({
			turn,
			piece: PieceType.PAWN,
			from: coordinateToLN([fromX, fromY]),
			to: coordinateToLN([toX, toY]),
		})
		if (fromY === startRow && !board[fromY + 2 * direction][fromX]) {
			moves.push({
				turn,
				piece: PieceType.PAWN,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX, fromY + 2 * direction]),
			})
		}
	}
	toSquare = board[fromY + direction][fromX + 1]
	if (toSquare && getPieceColor(toSquare) === opponentColor) {
		moves.push({
			turn,
			piece: PieceType.PAWN,
			from: coordinateToLN([fromX, fromY]),
			to: coordinateToLN([fromX + 1, fromY + direction]),
		})
	}
	toSquare = board[fromY + direction][fromX - 1]
	if (toSquare && getPieceColor(toSquare) === opponentColor) {
		moves.push({
			turn,
			piece: PieceType.PAWN,
			from: coordinateToLN([fromX, fromY]),
			to: coordinateToLN([fromX - 1, fromY + direction]),
		})
	}

	return moves
}

/**
 * Calculates what moves could a rook on fromX fromY do "not necessarily valid"
 * @param fromX x coordinate of the rook
 * @param fromY y coordinate of the rook
 * @param turn rook color
 * @param board the board to check on
 * @returns a MoveWrapper array
 */
function getRookMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const opponentColor: PlayerColor = oppositeColor(playerColor)
	let toSquare: string | null = null
	//right
	for (let i = fromX + 1; i < 8; i++) {
		toSquare = board[fromY][i]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: PieceType.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([i, fromY]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: PieceType.ROOK,
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
				piece: PieceType.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([i, fromY]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: PieceType.ROOK,
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
				piece: PieceType.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX, i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: PieceType.ROOK,
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
				piece: PieceType.ROOK,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX, i]),
			})
		} else if (getPieceColor(toSquare) === opponentColor) {
			moves.push({
				turn: playerColor,
				piece: PieceType.ROOK,
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

/**
 * Calculates what moves could a knight on fromX fromY do "not necessarily valid"
 * @param fromX x coordinate of the knight
 * @param fromY y coordinate of the knight
 * @param turn knight color
 * @param board the board to check on
 * @returns a MoveWrapper array
 */
function getKnightMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): MoveWrapper[] {
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
					piece: PieceType.KNIGHT,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([x, y]),
				})
			}
		}
	})

	return moves
}

/**
 * Calculates what moves could a bishop on fromX fromY do "not necessarily valid"
 * @param fromX x coordinate of the bishop
 * @param fromY y coordinate of the bishop
 * @param turn bishop color
 * @param board the board to check on
 * @returns a MoveWrapper array
 */
function getBishopMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const opponentColor: PlayerColor = oppositeColor(playerColor)
	let toSquare: string | null = null

	//up right
	for (let i = 1; fromX + i < 8 && fromY + i < 8; i++) {
		toSquare = board[fromY + i][fromX + i]
		if (toSquare === null) {
			moves.push({
				turn: playerColor,
				piece: PieceType.BISHOP,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX + i, fromY + i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: PieceType.BISHOP,
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
				piece: PieceType.BISHOP,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX - i, fromY + i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: PieceType.BISHOP,
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
				piece: PieceType.BISHOP,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX + i, fromY - i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: PieceType.BISHOP,
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
				piece: PieceType.BISHOP,
				from: coordinateToLN([fromX, fromY]),
				to: coordinateToLN([fromX - i, fromY - i]),
			})
		} else {
			if (getPieceColor(toSquare) === opponentColor)
				moves.push({
					turn: playerColor,
					piece: PieceType.BISHOP,
					from: coordinateToLN([fromX, fromY]),
					to: coordinateToLN([fromX - i, fromY - i]),
				})
			break
		}
	}

	return moves
}

/**
 * Calculates what moves could a queen on fromX fromY do "not necessarily valid".
 * Uses getRookMoves and getBishopMoves to calculate.
 * @param fromX x coordinate of the queen
 * @param fromY y coordinate of the queen
 * @param turn queen color
 * @param board the board to check on
 * @returns a MoveWrapper array
 */
function getQueenMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): MoveWrapper[] {
	const moves: MoveWrapper[] = []

	moves.push(...getRookMoves(fromX, fromY, playerColor, board))
	moves.push(...getBishopMoves(fromX, fromY, playerColor, board))

	moves.forEach((move) => (move.piece = PieceType.QUEEN))

	return moves
}

function getKingOneSquareMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
	let moves: Move[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const from = coordinateToLN([fromX, fromY])

	if (!from) return []

	moves.push({ from, to: coordinateToLN([fromX + 1, fromY]) })
	moves.push({ from, to: coordinateToLN([fromX - 1, fromY]) })
	moves.push({ from, to: coordinateToLN([fromX, fromY + 1]) })
	moves.push({ from, to: coordinateToLN([fromX, fromY - 1]) })
	moves.push({ from, to: coordinateToLN([fromX + 1, fromY + 1]) })
	moves.push({ from, to: coordinateToLN([fromX + 1, fromY - 1]) })
	moves.push({ from, to: coordinateToLN([fromX - 1, fromY + 1]) })
	moves.push({ from, to: coordinateToLN([fromX - 1, fromY - 1]) })

	moves = moves.filter(({ from, to }) => {
		if (!from || !to) return false
		const coordinate = lnToCoordinates(to)
		if (!coordinate) return false
		const [x, y] = coordinate

		if (x >= 0 && x < 8 && y >= 0 && y < 8) {
			const toSquare = board[y][x]
			const isCapture = toSquare !== null && getPieceColor(toSquare) === oppositeColor(playerColor)
			if (toSquare === null || isCapture) {
				return true
			}
			return false
		}
		return false
	})

	return moves
}

/**
 * Calculates what moves could a king on fromX fromY do "not necessarily valid"
 * @param fromX x coordinate of the king
 * @param fromY y coordinate of the king
 * @param turn king color
 * @param board the board to check on
 * @returns a MoveWrapper array
 */
function getKingMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): MoveWrapper[] {
	let moves: Move[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return []
	}

	const from = coordinateToLN([fromX, fromY])

	if (!from) return []

	moves.push(...getKingOneSquareMoves(fromX, fromY, playerColor, board))

	// ----------------------
	// CASTLING LOGIC BELOW
	// ----------------------
	// We assume that if the king is still on its original square, it hasn't moved.
	// (In a complete implementation you would track move history or castling rights separately.)
	if (playerColor === PlayerColor.WHITE && from === "e1" && !isCheck(playerColor, board)) {
		// White kingside castling (King: e1 -> g1, Rook: h1 -> f1)
		// Ensure squares f1 ([5,7]) and g1 ([6,7]) are empty
		if (board[7][5] === null && board[7][6] === null) {
			const kingsideRook = board[7][7]
			if (kingsideRook && getPieceType(kingsideRook) === PieceType.ROOK && getPieceColor(kingsideRook) === PlayerColor.WHITE) {
				// Verify that the king does not pass through or land on an attacked square.
				const boardAfterF1 = immitateTestBoardAfterMove(board, { from, to: "f1" })
				const boardAfterG1 = immitateTestBoardAfterMove(board, { from, to: "g1" })
				if (boardAfterF1 && boardAfterG1 && !isCheck(playerColor, boardAfterF1) && !isCheck(playerColor, boardAfterG1)) {
					moves.push({ from, to: "g1" })
				}
			}
		}

		// White queenside castling (King: e1 -> c1, Rook: a1 -> d1)
		// Ensure squares between king and rook are empty: d1 ([3,7]), c1 ([2,7]), and b1 ([1,7])
		if (board[7][3] === null && board[7][2] === null && board[7][1] === null) {
			const queensideRook = board[7][0]
			if (queensideRook && getPieceType(queensideRook) === PieceType.ROOK && getPieceColor(queensideRook) === PlayerColor.WHITE) {
				const boardAfterD1 = immitateTestBoardAfterMove(board, { from, to: "d1" })
				const boardAfterC1 = immitateTestBoardAfterMove(board, { from, to: "c1" })
				if (boardAfterD1 && boardAfterC1 && !isCheck(playerColor, boardAfterD1) && !isCheck(playerColor, boardAfterC1)) {
					moves.push({ from, to: "c1" })
				}
			}
		}
	} else if (playerColor === PlayerColor.BLACK && from === "e8" && !isCheck(playerColor, board)) {
		// Black kingside castling (King: e8 -> g8, Rook: h8 -> f8)
		// In our board, black's back rank is row 0.
		if (board[0][5] === null && board[0][6] === null) {
			const kingsideRook = board[0][7]
			if (kingsideRook && getPieceType(kingsideRook) === PieceType.ROOK && getPieceColor(kingsideRook) === PlayerColor.BLACK) {
				const boardAfterF8 = immitateTestBoardAfterMove(board, { from, to: "f8" })
				const boardAfterG8 = immitateTestBoardAfterMove(board, { from, to: "g8" })
				if (boardAfterF8 && boardAfterG8 && !isCheck(playerColor, boardAfterF8) && !isCheck(playerColor, boardAfterG8)) {
					moves.push({ from, to: "g8" })
				}
			}
		}

		// Black queenside castling (King: e8 -> c8, Rook: a8 -> d8)
		if (board[0][1] === null && board[0][2] === null && board[0][3] === null) {
			const queensideRook = board[0][0]
			if (queensideRook && getPieceType(queensideRook) === PieceType.ROOK && getPieceColor(queensideRook) === PlayerColor.BLACK) {
				const boardAfterD8 = immitateTestBoardAfterMove(board, { from, to: "d8" })
				const boardAfterC8 = immitateTestBoardAfterMove(board, { from, to: "c8" })
				if (boardAfterD8 && boardAfterC8 && !isCheck(playerColor, boardAfterD8) && !isCheck(playerColor, boardAfterC8)) {
					moves.push({ from, to: "c8" })
				}
			}
		}
	}

	const moveWrappers: MoveWrapper[] = []

	moves.forEach((m) => {
		const move: MoveWrapper = {
			...m,
			turn: playerColor,
			piece: PieceType.KING,
		}
		moveWrappers.push(move)
	})

	return moveWrappers
}

/**
 * Checks if there is a check on the board to the checked color
 * @param checkedColor the color to check
 * @param board the board to check
 * @returns the checked king position as a string or undefined if there is no check
 */
export function isCheck(checkedColor: PlayerColor, board: Board): string | undefined {
	const checkedKingPosition = getKingPosition(checkedColor, board)
	const opponentColor = oppositeColor(checkedColor)

	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (!piece || getPieceColor(piece) !== opponentColor) continue
			const pieceType: PieceType = getPieceType(piece)
			switch (pieceType) {
				case PieceType.PAWN: {
					const pawnMoves = getPawnMoves(x, y, opponentColor, board)
					if (pawnMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}

				case PieceType.ROOK: {
					const rookMoves = getRookMoves(x, y, opponentColor, board)
					if (rookMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				case PieceType.KNIGHT: {
					const knightMoves = getKnightMoves(x, y, opponentColor, board)
					if (knightMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				case PieceType.BISHOP: {
					const bishopMoves = getBishopMoves(x, y, opponentColor, board)
					if (bishopMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				case PieceType.QUEEN: {
					const queenMoves = getQueenMoves(x, y, opponentColor, board)
					if (queenMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				case PieceType.KING: {
					const kingMoves = getKingOneSquareMoves(x, y, opponentColor, board)
					if (kingMoves.some((m) => m.to === checkedKingPosition)) return checkedKingPosition
					break
				}
				default:
					return undefined
			}
		}
	}
}

/**
 * Checks whether the move is causing a promotion
 * @param move move to be checked
 * @returns true if the move is causing a promotion, false otherwise
 */
export function isPromotion(move: MoveWrapper): boolean {
	const toCoordinates = lnToCoordinates(move.to)
	if (move.piece === PieceType.PAWN && toCoordinates) {
		const toY = toCoordinates[1]
		const lastRow = move.turn === PlayerColor.WHITE ? 0 : 7

		console.log({ toY, lastRow })
		return toY === lastRow
	}
	console.log("no promotion at", move.to, toCoordinates, "for piece", move.piece)
	return false
}
