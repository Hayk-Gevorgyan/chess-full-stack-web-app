import { Board, GameState, Move, PieceType, PlayerColor } from "../types/types"
import {
	coordinateToLN,
	getPieceColor,
	getPieceType,
	immitateTestBoardAfterMove,
	lnToCoordinates,
	oppositeColor,
} from "../utils/helperFunctions/gameHelperFunctions"
import { logFunctionExecution } from "../utils/helperFunctions/logFunctions"

export interface IChessValidator {
	validateMove(board: Board, move: Move): boolean
	getGameState(turn: PlayerColor, board: Board): GameState
}

export default class ChessValidator implements IChessValidator {
	private isLog: boolean

	constructor(isLog: boolean) {
		this.isLog = isLog || false
	}

	public validateMove(board: Board, move: Move) {
		return this.isLog ? this.isValidMoveWithLogging(board, move) : this.isValidMoveWithoutLogging(board, move)
	}

	// private isCheck(turn: PlayerColor, board: Board): boolean {
	// 	return this.isLog ? this.isCheckWithLogging(turn, board) : this.isCheckWithoutLogging(turn, board)
	// }

	private hasTurnMoves(turn: PlayerColor, board: Board): boolean {
		return this.isLog ? this.hasTurnMovesWithLogging(turn, board) : this.hasTurnMovesWithoutLogging(turn, board)
	}

	private getTurnMoves(turn: PlayerColor, board: Board) {
		return this.isLog ? this.getTurnMovesWithLogging(turn, board) : this.getTurnMovesWithoutLogging(turn, board)
	}

	private getPawnMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		return this.isLog
			? this.getPawnMovesWithLogging(fromX, fromY, playerColor, board)
			: this.getPawnMovesWithoutLogging(fromX, fromY, playerColor, board)
	}

	private getRookMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		return this.isLog
			? this.getRookMovesWithLogging(fromX, fromY, playerColor, board)
			: this.getRookMovesWithoutLogging(fromX, fromY, playerColor, board)
	}

	private getKnightMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		return this.isLog
			? this.getKnightMovesWithLogging(fromX, fromY, playerColor, board)
			: this.getKnightMovesWithoutLogging(fromX, fromY, playerColor, board)
	}

	private getBishopMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		return this.isLog
			? this.getBishopMovesWithLogging(fromX, fromY, playerColor, board)
			: this.getBishopMovesWithoutLogging(fromX, fromY, playerColor, board)
	}

	private getQueenMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		return this.isLog
			? this.getQueenMovesWithLogging(fromX, fromY, playerColor, board)
			: this.getQueenMovesWithoutLogging(fromX, fromY, playerColor, board)
	}

	private getKingMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		return this.isLog
			? this.getKingMovesWithLogging(fromX, fromY, playerColor, board)
			: this.getKingMovesWithoutLogging(fromX, fromY, playerColor, board)
	}

	private getKingPosition(color: PlayerColor, board: Board): string | undefined {
		return this.isLog ? this.getKingPositionWithLogging(color, board) : this.getKingPositionWithoutLogging(color, board)
	}

	private isValidMoveWithoutLogging(board: Board, move: Move): boolean {
		const from = lnToCoordinates(move.from)
		if (!from) {
			return false
		}
		const [fromX, fromY] = from
		const piece = board[fromY][fromX]
		if (!piece) {
			return false
		}
		const turn: PlayerColor = getPieceColor(piece) === PlayerColor.WHITE ? PlayerColor.WHITE : PlayerColor.BLACK

		const turnMoves: Move[] = this.getTurnMoves(turn, board)

		if (turnMoves.find((m) => move.from === m.from && move.to === m.to)) {
			return true
		}
		return false
	}

	public getGameState(turn: PlayerColor, board: Board): GameState {
		//check for check
		if (this.isCheck(turn, board)) {
			//check for checkmate
			if (!this.hasTurnMoves(turn, board)) {
				const gameState = turn === PlayerColor.WHITE ? GameState.BLACK_WIN : GameState.WHITE_WIN
				return gameState
			}
		}
		//check for stalemate
		else if (!this.hasTurnMoves(turn, board)) {
			return GameState.DRAW
		}

		return GameState.STARTED
	}

	private isValidMoveWithLogging = logFunctionExecution(this.isValidMoveWithoutLogging)

	private getTurnMovesWithLogging = logFunctionExecution(this.getTurnMovesWithoutLogging)

	private hasTurnMovesWithLogging = logFunctionExecution(this.hasTurnMovesWithoutLogging)

	private getPawnMovesWithLogging = logFunctionExecution(this.getPawnMovesWithoutLogging)

	private getRookMovesWithLogging = logFunctionExecution(this.getRookMovesWithoutLogging)

	private getKnightMovesWithLogging = logFunctionExecution(this.getKnightMovesWithoutLogging)

	private getBishopMovesWithLogging = logFunctionExecution(this.getBishopMovesWithoutLogging)

	private getQueenMovesWithLogging = logFunctionExecution(this.getQueenMovesWithoutLogging)

	private getKingMovesWithLogging = logFunctionExecution(this.getKingMovesWithoutLogging)

	// private isCheckWithLogging = logFunctionExecution(this.isCheckWithoutLogging)

	private getKingPositionWithLogging = logFunctionExecution(this.getKingPositionWithoutLogging)

	private getTurnMovesWithoutLogging(turn: PlayerColor, board: Board): Move[] {
		const moves: Move[] = []

		//collect all not blocked moves and captures
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				const piece = board[y][x]
				if (!piece || getPieceColor(piece) !== turn) continue
				const pieceType: PieceType = getPieceType(piece)
				switch (pieceType) {
					case PieceType.PAWN:
						const pawnMoves = this.getPawnMoves(x, y, turn, board)
						moves.push(...pawnMoves)
						break
					case PieceType.ROOK:
						const rookMoves = this.getRookMoves(x, y, turn, board)
						moves.push(...rookMoves)
						break
					case PieceType.KNIGHT:
						const knightMoves = this.getKnightMoves(x, y, turn, board)
						moves.push(...knightMoves)
						break
					case PieceType.BISHOP:
						const bishopMoves = this.getBishopMoves(x, y, turn, board)
						moves.push(...bishopMoves)
						break
					case PieceType.QUEEN:
						const queenMoves = this.getQueenMoves(x, y, turn, board)
						moves.push(...queenMoves)
						break
					case PieceType.KING:
						const kingMoves = this.getKingMoves(x, y, turn, board)
						moves.push(...kingMoves)
						break
					default:
						continue
				}
			}
		}

		//return moves after which check doesnt occure to own king
		return moves.filter((m) => {
			const newBoard = immitateTestBoardAfterMove(board, m)
			if (!newBoard) return false
			return !this.isCheck(turn, newBoard)
		})
	}

	private hasTurnMovesWithoutLogging(turn: PlayerColor, board: Board): boolean {
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				const piece = board[y][x]
				if (!piece || getPieceColor(piece) !== turn) continue
				const pieceType: PieceType = getPieceType(piece)
				switch (pieceType) {
					case PieceType.PAWN:
						if (
							this.getPawnMoves(x, y, turn, board).some((m) => {
								const newBoard = immitateTestBoardAfterMove(board, m)
								if (!newBoard) return false
								return !this.isCheck(turn, newBoard)
							})
						)
							return true
						break
					case PieceType.ROOK:
						if (
							this.getRookMoves(x, y, turn, board).some((m) => {
								const newBoard = immitateTestBoardAfterMove(board, m)
								if (!newBoard) return false
								return !this.isCheck(turn, newBoard)
							})
						)
							return true
						break
					case PieceType.KNIGHT:
						if (
							this.getKnightMoves(x, y, turn, board).some((m) => {
								const newBoard = immitateTestBoardAfterMove(board, m)
								if (!newBoard) return false
								return !this.isCheck(turn, newBoard)
							})
						)
							return true
						break
					case PieceType.BISHOP:
						if (
							this.getBishopMoves(x, y, turn, board).some((m) => {
								const newBoard = immitateTestBoardAfterMove(board, m)
								if (!newBoard) return false
								return !this.isCheck(turn, newBoard)
							})
						)
							return true
						break
					case PieceType.QUEEN:
						if (
							this.getQueenMoves(x, y, turn, board).some((m) => {
								const newBoard = immitateTestBoardAfterMove(board, m)
								if (!newBoard) return false
								return !this.isCheck(turn, newBoard)
							})
						)
							return true
						break
					case PieceType.KING:
						if (
							this.getKingMoves(x, y, turn, board).some((m) => {
								const newBoard = immitateTestBoardAfterMove(board, m)
								if (!newBoard) return false
								return !this.isCheck(turn, newBoard)
							})
						)
							return true
						break
					default:
						continue
				}
			}
		}

		return false
	}

	private getPawnMovesWithoutLogging(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		const moves: Move[] = []

		if (fromX == null || fromY == null || !playerColor || !board) {
			return moves
		}

		const direction = playerColor === PlayerColor.WHITE ? -1 : 1
		const startRow = playerColor === PlayerColor.WHITE ? 6 : 1
		const lastRow = playerColor === PlayerColor.WHITE ? 0 : 7
		const opponentColor = oppositeColor(playerColor)
		const from = coordinateToLN([fromX, fromY])

		if (fromY === lastRow) {
			return moves
		}
		if (from) {
			const toSquare = board[fromY + direction][fromX]
			const to = coordinateToLN([fromX, fromY + direction])
			if (toSquare === null && to) {
				moves.push({
					from,
					to,
				})
				if (fromY === startRow) {
					const toFirstMoveSquare = board[fromY + 2 * direction][fromX]
					const toFirst = coordinateToLN([fromX, fromY + 2 * direction])
					if (toFirstMoveSquare === null && toFirst) {
						moves.push({
							from,
							to: toFirst,
						})
					}
				}
			}
			const toRightCaptureSquare = board[fromY + direction][fromX + 1]
			const toRightCapture = coordinateToLN([fromX + 1, fromY + direction])
			if (toRightCapture && getPieceColor(toRightCaptureSquare) === opponentColor) {
				moves.push({
					from,
					to: toRightCapture,
				})
			}

			const toLeftCaptureSquare = board[fromY + direction][fromX - 1]
			const toLeftCapture = coordinateToLN([fromX - 1, fromY + direction])
			if (toLeftCapture && getPieceColor(toLeftCaptureSquare) === opponentColor) {
				moves.push({
					from,
					to: toLeftCapture,
				})
			}
		}

		return moves
	}

	private getRookMovesWithoutLogging(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		const moves: Move[] = []

		if (fromX == null || fromY == null || !playerColor || !board) {
			return moves
		}

		const opponentColor: PlayerColor = oppositeColor(playerColor)
		const from = coordinateToLN([fromX, fromY])

		if (from) {
			//right
			for (let i = fromX + 1; i < 8; i++) {
				const to = coordinateToLN([i, fromY])
				if (!to) break
				if (board[fromY][i] === null) {
					moves.push({
						from,
						to,
					})
				} else {
					if (getPieceColor(board[fromY][i]) === opponentColor)
						moves.push({
							from,
							to,
						})
					break
				}
			}

			//left
			for (let i = fromX - 1; i >= 0; i--) {
				const to = coordinateToLN([i, fromY])
				if (!to) break
				if (board[fromY][i] === null) {
					moves.push({
						from,
						to,
					})
				} else {
					if (getPieceColor(board[fromY][i]) === opponentColor)
						moves.push({
							from,
							to,
						})
					break
				}
			}

			//down
			for (let i = fromY + 1; i < 8; i++) {
				const to = coordinateToLN([fromX, i])
				if (!to) break
				if (board[i][fromX] === null) {
					moves.push({
						from,
						to,
					})
				} else {
					if (getPieceColor(board[i][fromX]) === opponentColor)
						moves.push({
							from,
							to,
						})
					break
				}
			}

			//up
			for (let i = fromY - 1; i >= 0; i--) {
				const to = coordinateToLN([fromX, i])
				if (!to) break
				if (board[i][fromX] === null) {
					moves.push({
						from,
						to,
					})
				} else if (getPieceColor(board[i][fromX]) === opponentColor) {
					moves.push({
						from,
						to,
					})
					break
				} else {
					break
				}
			}
		}

		return moves
	}

	private getKnightMovesWithoutLogging(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		if (fromX == null || fromY == null || !playerColor || !board) {
			return []
		}

		const moves: any[] = []
		const from = coordinateToLN([fromX, fromY])

		if (!from) return []
		moves.push({ from, to: coordinateToLN([fromX - 2, fromY + 1]) })
		moves.push({ from, to: coordinateToLN([fromX - 2, fromY - 1]) })
		moves.push({ from, to: coordinateToLN([fromX - 1, fromY - 2]) })
		moves.push({ from, to: coordinateToLN([fromX + 1, fromY - 2]) })
		moves.push({ from, to: coordinateToLN([fromX + 2, fromY - 1]) })
		moves.push({ from, to: coordinateToLN([fromX + 2, fromY + 1]) })
		moves.push({ from, to: coordinateToLN([fromX + 1, fromY + 2]) })
		moves.push({ from, to: coordinateToLN([fromX - 1, fromY + 2]) })

		return moves.filter(({ from, to }) => {
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
	}

	private getBishopMovesWithoutLogging(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		const moves: Move[] = []

		if (fromX == null || fromY == null || !playerColor || !board) {
			return moves
		}

		const opponentColor: PlayerColor = oppositeColor(playerColor)
		const from = coordinateToLN([fromX, fromY])

		if (from) {
			//up right
			for (let i = 1; fromX + i < 8 && fromY + i < 8; i++) {
				const to = coordinateToLN([fromX + i, fromY + i])
				if (!to) break
				if (board[fromY + i]?.[fromX + i] === null) {
					moves.push({
						from,
						to,
					})
				} else {
					if (getPieceColor(board[fromY + i][fromX + i]) === opponentColor)
						moves.push({
							from,
							to,
						})
					break
				}
			}

			//up left
			for (let i = 1; fromX - i >= 0 && fromY + i < 8; i++) {
				const to = coordinateToLN([fromX - i, fromY + i])
				if (!to) break
				if (board[fromY + i][fromX - i] === null) {
					moves.push({
						from,
						to,
					})
				} else {
					if (getPieceColor(board[fromY + i][fromX - i]) === opponentColor)
						moves.push({
							from,
							to,
						})
					break
				}
			}

			//down right
			for (let i = 1; fromX + i < 8 && fromY - i >= 0; i++) {
				const to = coordinateToLN([fromX + i, fromY - i])
				if (!to) break
				if (board[fromY - i][fromX + i] === null) {
					moves.push({
						from,
						to,
					})
				} else {
					if (getPieceColor(board[fromY - i][fromX + i]) === opponentColor)
						moves.push({
							from,
							to,
						})
					break
				}
			}

			//down left
			for (let i = 1; fromX - i >= 0 && fromY - i >= 0; i++) {
				const to = coordinateToLN([fromX - i, fromY - i])
				if (!to) break
				if (board[fromY - i][fromX - i] === null) {
					moves.push({
						from,
						to,
					})
				} else {
					if (getPieceColor(board[fromY - i][fromX - i]) === opponentColor)
						moves.push({
							from,
							to,
						})
					break
				}
			}
		}

		return moves
	}

	private getQueenMovesWithoutLogging(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		const moves: Move[] = []

		moves.push(...this.getRookMovesWithoutLogging(fromX, fromY, playerColor, board))
		moves.push(...this.getBishopMovesWithoutLogging(fromX, fromY, playerColor, board))

		return moves
	}

	private getKingOneSquareMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		let moves: any[] = []

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

	private getKingMovesWithoutLogging(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
		let moves: any[] = []

		if (fromX == null || fromY == null || !playerColor || !board) {
			return moves
		}

		const from = coordinateToLN([fromX, fromY])

		if (!from) return []

		moves.push(...this.getKingOneSquareMoves(fromX, fromY, playerColor, board))

		// ----------------------
		// CASTLING LOGIC BELOW
		// ----------------------
		// We assume that if the king is still on its original square, it hasn't moved.
		// (In a complete implementation you would track move history or castling rights separately.)
		if (playerColor === PlayerColor.WHITE && from === "e1" && !this.isCheck(playerColor, board)) {
			// White kingside castling (King: e1 -> g1, Rook: h1 -> f1)
			// Ensure squares f1 ([5,7]) and g1 ([6,7]) are empty
			if (board[7][5] === null && board[7][6] === null) {
				const kingsideRook = board[7][7]
				if (kingsideRook && getPieceType(kingsideRook) === PieceType.ROOK && getPieceColor(kingsideRook) === PlayerColor.WHITE) {
					// Verify that the king does not pass through or land on an attacked square.
					const boardAfterF1 = immitateTestBoardAfterMove(board, { from, to: "f1" })
					const boardAfterG1 = immitateTestBoardAfterMove(board, { from, to: "g1" })
					if (
						boardAfterF1 &&
						boardAfterG1 &&
						!this.isCheck(playerColor, boardAfterF1) &&
						!this.isCheck(playerColor, boardAfterG1)
					) {
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
					if (
						boardAfterD1 &&
						boardAfterC1 &&
						!this.isCheck(playerColor, boardAfterD1) &&
						!this.isCheck(playerColor, boardAfterC1)
					) {
						moves.push({ from, to: "c1" })
					}
				}
			}
		} else if (playerColor === PlayerColor.BLACK && from === "e8" && !this.isCheck(playerColor, board)) {
			// Black kingside castling (King: e8 -> g8, Rook: h8 -> f8)
			// In our board, black's back rank is row 0.
			if (board[0][5] === null && board[0][6] === null) {
				const kingsideRook = board[0][7]
				if (kingsideRook && getPieceType(kingsideRook) === PieceType.ROOK && getPieceColor(kingsideRook) === PlayerColor.BLACK) {
					const boardAfterF8 = immitateTestBoardAfterMove(board, { from, to: "f8" })
					const boardAfterG8 = immitateTestBoardAfterMove(board, { from, to: "g8" })
					if (
						boardAfterF8 &&
						boardAfterG8 &&
						!this.isCheck(playerColor, boardAfterF8) &&
						!this.isCheck(playerColor, boardAfterG8)
					) {
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
					if (
						boardAfterD8 &&
						boardAfterC8 &&
						!this.isCheck(playerColor, boardAfterD8) &&
						!this.isCheck(playerColor, boardAfterC8)
					) {
						moves.push({ from, to: "c8" })
					}
				}
			}
		}

		return moves
	}

	private isCheck(checkedColor: PlayerColor, board: Board): boolean {
		const checkedKingPosition = this.getKingPosition(checkedColor, board)
		if (!checkedKingPosition) return false
		const opponentColor = oppositeColor(checkedColor)

		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				const piece = board[y][x]
				if (!piece || getPieceColor(piece) !== opponentColor) continue
				const pieceType: PieceType = getPieceType(piece)
				switch (pieceType) {
					case PieceType.PAWN:
						if (
							this.getPawnMoves(x, y, opponentColor, board).some((m) => {
								return m.to === checkedKingPosition
							})
						)
							return true
						break
					case PieceType.ROOK:
						if (
							this.getRookMoves(x, y, opponentColor, board).some((m) => {
								return m.to === checkedKingPosition
							})
						)
							return true
						break
					case PieceType.KNIGHT:
						if (
							this.getKnightMoves(x, y, opponentColor, board).some((m) => {
								return m.to === checkedKingPosition
							})
						)
							return true
						break
					case PieceType.BISHOP:
						if (
							this.getBishopMoves(x, y, opponentColor, board).some((m) => {
								return m.to === checkedKingPosition
							})
						)
							return true
						break
					case PieceType.QUEEN:
						if (
							this.getQueenMoves(x, y, opponentColor, board).some((m) => {
								return m.to === checkedKingPosition
							})
						)
							return true
						break
					case PieceType.KING:
						if (
							this.getKingOneSquareMoves(x, y, opponentColor, board).some((m) => {
								return m.to === checkedKingPosition
							})
						)
							return true
						break
					default:
						continue
				}
			}
		}
		return false
	}

	private getKingPositionWithoutLogging(color: PlayerColor, board: Board): string | undefined {
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				const piece = board[y][x]
				if (piece && piece[0] === PieceType.KING && piece[1] === color) {
					return coordinateToLN([x, y])
				}
			}
		}
	}
}
