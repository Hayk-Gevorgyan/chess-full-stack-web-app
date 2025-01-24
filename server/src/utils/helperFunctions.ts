import { PieceType, PlayerColor } from "../types/types"

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

export function generateId(): string {
	return Math.random().toString(36).substr(2, 9) // Generates a string of 9 characters
}

export function logFunctionCall(functionName: string, args: any[]) {
	console.log(`Function: ${functionName} | Parameters: ${JSON.stringify(args)}`)
}

export function logFunctionExecution(fn: Function) {
	return function (this: any, ...args: any[]) {
		// Explicitly typing 'this' as 'any'

		const loggedArgs = args.filter((arg) => !Array.isArray(arg))
		console.log(`Function: ${fn.name} started with parameters:`, loggedArgs)
		const startTime = Date.now()

		// Call the original function
		const result = fn.apply(this, args)

		// If the function is asynchronous, handle promises
		if (result instanceof Promise) {
			return result.then((res) => {
				const endTime = Date.now()
				console.log(`Function: ${fn.name} ended. Time taken: ${endTime - startTime}ms`)
				return res
			})
		}

		const endTime = Date.now()
		console.log(`Function: ${fn.name} ended. Time taken: ${endTime - startTime}ms`)
		return result
	}
}
