import { Move, PlayerColor, PieceType, Board, GameState } from "../types/types"
import {
	lnToCoordinates,
	coordinateToLN,
	getPieceType,
	getPieceColor,
	oppositeColor,
	logFunctionCall,
	logFunctionExecution,
} from "../utils/helperFunctions"

export default function isValidMove(board: Board, move: Move): boolean {
	console.log("board")
	console.table(board)
	const from = lnToCoordinates(move.from)
	if (!from) return false
	const [fromX, fromY] = from
	const piece = board[fromY][fromX]
	if (!piece) return false
	const turn: PlayerColor = getPieceColor(piece) === PlayerColor.WHITE ? PlayerColor.WHITE : PlayerColor.BLACK

	// const loggedGetTurnMoves = logFunctionExecution(getTurnMoves)
	// const turnMoves: Move[] = loggedGetTurnMoves(turn, board)

	const turnMoves: Move[] = getTurnMoves(turn, board)
	if (turnMoves.find((m) => move.from === m.from && move.to === m.to)) {
		return true
	}
	return false
}
export function getGameState(turn: PlayerColor, board: Board): GameState {
	console.log("inside get game state")
	console.log("turn", turn, "board")
	console.table(board)
	//check for check
	if (isCheck(turn, board)) {
		console.log("check to", turn)
		//check for checkmate
		if (!hasTurnMoves(turn, board)) {
			console.log("no moves")
			const gameState = turn === PlayerColor.WHITE ? GameState.BLACK_WIN : GameState.WHITE_WIN
			console.log("game ends in", gameState)
			return gameState
		} else {
			console.log("check to", turn)
			console.log("turn moves alailable")
		}
	}
	//check for stalemate
	else if (!hasTurnMoves(turn, board)) {
		console.log("no check to", turn)
		console.log("no moves, game ends in stalemate")
		return GameState.DRAW
	}

	console.log("no check to", turn)
	console.log("turn moves available")
	console.log("gmae continues")

	return GameState.STARTED
}
function getTurnMoves(turn: PlayerColor, board: Board): Move[] {
	const moves: Move[] = []

	// const loggedGetPawnMoves = logFunctionExecution(getPawnMoves)
	// const loggedGetRookMoves = logFunctionExecution(getRookMoves)
	// const loggedGetKnightMoves = logFunctionExecution(getKnightMoves)
	// const loggedGetBishopMoves = logFunctionExecution(getBishopMoves)
	// const loggedGetQueenMoves = logFunctionExecution(getQueenMoves)
	// const loggedGetKingMoves = logFunctionExecution(getKingMoves)
	// const loggedImmitateBoardAfterMove = logFunctionExecution(immitateBoardAfterMove)

	//collect all not blocked moves and captures
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (!piece || getPieceColor(piece) !== turn) continue
			const pieceType: PieceType = getPieceType(piece)
			switch (pieceType) {
				case PieceType.PAWN:
					// moves.push(...loggedGetPawnMoves(x, y, turn, board))
					moves.push(...getPawnMoves(x, y, turn, board))
					break
				case PieceType.ROOK:
					// moves.push(...loggedGetRookMoves(x, y, turn, board))
					moves.push(...getRookMoves(x, y, turn, board))
					break
				case PieceType.KNIGHT:
					// moves.push(...loggedGetKnightMoves(x, y, turn, board))
					moves.push(...getKnightMoves(x, y, turn, board))
					break
				case PieceType.BISHOP:
					// moves.push(...loggedGetBishopMoves(x, y, turn, board))
					moves.push(...getBishopMoves(x, y, turn, board))
					break
				case PieceType.QUEEN:
					// moves.push(...loggedGetQueenMoves(x, y, turn, board))
					moves.push(...getQueenMoves(x, y, turn, board))
					break
				case PieceType.KING:
					// moves.push(...loggedGetKingMoves(x, y, turn, board))
					moves.push(...getKingMoves(x, y, turn, board))
					break
				default:
					continue
			}
		}
	}

	//return moves after which check doesnt occure to own king
	return moves.filter((m) => {
		// const newBoard = loggedImmitateBoardAfterMove(board, m)
		const newBoard = immitateBoardAfterMove(board, m)
		if (!newBoard) return false
		return !isCheck(turn, newBoard)
	})
}
function hasTurnMoves(turn: PlayerColor, board: Board): boolean {
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (!piece || getPieceColor(piece) !== turn) continue
			const pieceType: PieceType = getPieceType(piece)
			switch (pieceType) {
				case PieceType.PAWN:
					if (
						getPawnMoves(x, y, turn, board).some((m) => {
							const newBoard = immitateBoardAfterMove(board, m)
							if (!newBoard) return false
							return !isCheck(turn, newBoard)
						})
					)
						return true
					break
				case PieceType.ROOK:
					if (
						getRookMoves(x, y, turn, board).some((m) => {
							const newBoard = immitateBoardAfterMove(board, m)
							if (!newBoard) return false
							return !isCheck(turn, newBoard)
						})
					)
						return true
					break
				case PieceType.KNIGHT:
					if (
						getKnightMoves(x, y, turn, board).some((m) => {
							const newBoard = immitateBoardAfterMove(board, m)
							if (!newBoard) return false
							return !isCheck(turn, newBoard)
						})
					)
						return true
					break
				case PieceType.BISHOP:
					if (
						getBishopMoves(x, y, turn, board).some((m) => {
							const newBoard = immitateBoardAfterMove(board, m)
							if (!newBoard) return false
							return !isCheck(turn, newBoard)
						})
					)
						return true
					break
				case PieceType.QUEEN:
					if (
						getQueenMoves(x, y, turn, board).some((m) => {
							const newBoard = immitateBoardAfterMove(board, m)
							if (!newBoard) return false
							return !isCheck(turn, newBoard)
						})
					)
						return true
					break
				case PieceType.KING:
					if (
						getKingMoves(x, y, turn, board).some((m) => {
							const newBoard = immitateBoardAfterMove(board, m)
							if (!newBoard) return false
							return !isCheck(turn, newBoard)
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
function getPawnMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
	const moves: Move[] = []

	if (fromX == null || fromY == null || !playerColor || !board) {
		return moves
	}

	const direction = playerColor === PlayerColor.WHITE ? -1 : 1
	const startRow = playerColor === PlayerColor.WHITE ? 6 : 1
	const lastRow = playerColor === PlayerColor.WHITE ? 0 : 7
	const opponentColor = oppositeColor(playerColor)
	const from = coordinateToLN([fromX, fromY])

	if (fromX === lastRow) return moves
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
function getRookMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
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
function getKnightMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
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
function getBishopMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
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
function getQueenMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
	const moves: Move[] = []

	moves.push(...getRookMoves(fromX, fromY, playerColor, board))
	moves.push(...getBishopMoves(fromX, fromY, playerColor, board))

	return moves
}
function getKingMoves(fromX: number, fromY: number, playerColor: PlayerColor, board: Board): Move[] {
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
function immitateBoardAfterMove(board: Board, move: Move): Board | undefined {
	const fromCoordinate = lnToCoordinates(move.from)
	const toCoordinate = lnToCoordinates(move.to)
	if (!fromCoordinate || !toCoordinate) return undefined
	const [fromX, fromY] = fromCoordinate
	const [toX, toY] = toCoordinate
	const newBoard: Board = board.map((row) => row.slice())
	const piece = newBoard[fromY][fromX]
	newBoard[toY][toX] = piece
	newBoard[fromY][fromX] = null
	return newBoard
}
function isCheck(checkedColor: PlayerColor, board: Board): boolean {
	const checkedKingPosition = getKingPosition(checkedColor, board)
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
						getPawnMoves(x, y, opponentColor, board).some((m) => {
							return m.to === checkedKingPosition
						})
					)
						return true
					break
				case PieceType.ROOK:
					if (
						getRookMoves(x, y, opponentColor, board).some((m) => {
							return m.to === checkedKingPosition
						})
					)
						return true
					break
				case PieceType.KNIGHT:
					if (
						getKnightMoves(x, y, opponentColor, board).some((m) => {
							return m.to === checkedKingPosition
						})
					)
						return true
					break
				case PieceType.BISHOP:
					if (
						getBishopMoves(x, y, opponentColor, board).some((m) => {
							return m.to === checkedKingPosition
						})
					)
						return true
					break
				case PieceType.QUEEN:
					if (
						getQueenMoves(x, y, opponentColor, board).some((m) => {
							return m.to === checkedKingPosition
						})
					)
						return true
					break
				case PieceType.KING:
					if (
						getKingMoves(x, y, opponentColor, board).some((m) => {
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
function getKingPosition(color: PlayerColor, board: Board): string | undefined {
	// logFunctionCall("getKingPosition", [color])
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const piece = board[y][x]
			if (piece && piece[0] === PieceType.KING && piece[1] === color) {
				return coordinateToLN([x, y])
			}
		}
	}
}
