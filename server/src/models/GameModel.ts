import isValidMove, { getGameState } from "../chessValidation/chessValidator"
import { Game, Move, GameState, PlayerColor, Board } from "../types/types"
import { generateId, lnToCoordinates, logFunctionExecution } from "../utils/helperFunctions"

//singleton class
export default class GameModel {
	private activeGames: Game[] = []
	private endedGames: Game[] = []
	private waitingPlayers: Map<string, string> = new Map<string, string>()
	private static _instance: GameModel | undefined = undefined

	constructor() {
		if (GameModel._instance) {
			return GameModel._instance
		}
		GameModel._instance = this
		return GameModel._instance
	}

	handleStartGame(username: string): { id: string; game?: Game } {
		if (this.isPlayerWaiting(username)) {
			throw new Error(`User ${username} is already waiting for a game.`)
		}

		const [waitingUsername, gameId] = this.waitingPlayers.entries().next().value || []
		if (waitingUsername && gameId) {
			this.removeWaitingPlayerByUsername(waitingUsername)
			const game = this.addGame(gameId, { username1: waitingUsername, username2: username })
			return { id: game.id, game }
		} else {
			const newGameId = generateId()
			this.addWaitingPlayer(username, newGameId)
			return { id: newGameId }
		}
	}

	handleMakeMove(gameId: string, username: string, move: Move): Game | undefined {
		if (this.makeMove(gameId, username, move)) {
			const activeGame = this.findActiveGameById(gameId)
			if (activeGame) return activeGame
			return this.findEndedGameById(gameId)
		}
	}

	handleResign(gameId: string, username: string) {
		const game = this.resign(gameId, username)
		return game
	}

	handleOfferDraw(gameId: string, username: string) {
		const activeGame = this.findActiveGameById(gameId)
		if (activeGame) {
			activeGame.drawOffer = username
			return activeGame
		} else {
			console.error(`no active game found with id ${gameId}`)
		}
	}

	handleAcceptDraw(gameId: string, username: string) {
		const activeGame = this.findActiveGameById(gameId)
		if (activeGame) {
			if (activeGame.drawOffer !== username) {
				activeGame.drawOffer = undefined
				return this.endGame(gameId, GameState.DRAW)
			}
		} else {
			console.error(`no active game found with id ${gameId}`)
		}
	}

	handleDenyDraw(gameId: string, username: string) {
		const activeGame = this.findActiveGameById(gameId)
		if (activeGame) {
			if (activeGame.drawOffer !== username) {
				activeGame.drawOffer = undefined
				return activeGame
			}
		} else {
			console.error(`no active game found with id ${gameId}`)
		}
	}

	static initialBoardSetup(): Board {
		const newBoard: (string | null)[][] = Array(8)
			.fill(null)
			.map(() => Array(8).fill(null))
		newBoard[0] = ["rb", "nb", "bb", "qb", "kb", "bb", "nb", "rb"]
		newBoard[1] = Array(8).fill("pb")
		newBoard[6] = Array(8).fill("pw")
		newBoard[7] = ["rw", "nw", "bw", "qw", "kw", "bw", "nw", "rw"]
		return newBoard
	}

	static boardAfterMoves(moves: Move[]): Board {
		let derivedBoard: Board = this.initialBoardSetup()
		moves.forEach((move) => {
			derivedBoard = this.immitateBoardAfterMove(derivedBoard, move)
		})
		return derivedBoard
	}

	static immitateBoardAfterMove(board: Board, move: Move) {
		const from = lnToCoordinates(move.from)
		const to = lnToCoordinates(move.to)
		if (!from || !to) throw new Error("from ot to properties of move are not valid")
		const [fromX, fromY] = from
		const [toX, toY] = to
		const newBoard: Board = board.map((row) => row.slice())
		const piece = move.promotion ? move.promotion : board[fromY][fromX]
		newBoard[toY][toX] = piece
		newBoard[fromY][fromX] = null
		return newBoard
	}

	private persistActiveGame(newGame: Game): Game | undefined {
		try {
			const activeGame = this.findActiveGameById(newGame.id)
			if (activeGame) {
				activeGame.moves = newGame.moves
				console.log(`active game with ID ${activeGame.id} persisted successfully at index ${this.activeGames.indexOf(activeGame)}.`)
				return activeGame
			} else {
				const endedGame = this.findEndedGameById(newGame.id)
				if (endedGame) {
					console.warn(`game with ID ${endedGame.id} has already ended.`)
					return endedGame
				} else {
					this.activeGames.push(newGame)
					console.log(`active game with ID ${newGame.id} initialized successfully at index ${this.activeGames.indexOf(newGame)}.`)
					return activeGame
				}
			}
		} catch (error) {
			console.error("Error persisting game:", error)
		}
	}

	private persistEndedGame(newGame: Game): Game | undefined {
		try {
			if (this.activeGames.some((g) => newGame.id === g.id)) {
				this.removeActiveGameById(newGame.id)
				if (!this.endedGames.some((g) => newGame.id === g.id)) {
					this.endedGames.push(newGame)
				}
				return newGame
			}
		} catch (error) {
			console.error("Failed to persist ended game." + error)
		}
	}

	findActiveGameById(id: string): Game | undefined {
		return this.activeGames.find((game) => game.id === id)
	}

	findActiveGameByUsername(username: string): Game | undefined {
		return this.activeGames.find((game) => game.white === username || game.black === username)
	}

	findEndedGameById(id: string): Game | undefined {
		return this.endedGames.find((game) => game.id === id)
	}

	findEndedGameByUsername(username: string): Game | undefined {
		return this.endedGames.find((game) => game.white === username || game.black === username)
	}

	findAllEndedGamesByUsername(username: string): Game[] | undefined {
		const games = this.endedGames.filter((game) => game.white === username || game.black === username)
		return games ? games : []
	}
	private removeActiveGameById(id: string): Game | undefined {
		const index = this.activeGames.findIndex((game) => game.id === id)
		if (index !== -1) {
			return this.activeGames.splice(index, 1)[0]
		}
		return undefined
	}

	private addGame(id: string, { username1, username2 }: { username1: string; username2: string }): Game {
		const game: Game = {
			id,
			white: username1,
			black: username2,
			moves: [],
			state: GameState.STARTED,
		}

		this.persistActiveGame(game)
		return game
	}

	isPlayerWaiting(username: string): boolean {
		return this.waitingPlayers.has(username)
	}
	removeWaitingPlayerByUsername(username: string): void {
		this.waitingPlayers.delete(username)
	}

	addWaitingPlayer(username: string, newGameId: string): void {
		this.waitingPlayers.set(username, newGameId)
	}

	endGame(id: string, gameState: GameState): Game | undefined {
		const game = this.findActiveGameById(id)
		if (!game) return

		const newGame = { ...game, state: gameState }
		const persistedGame = this.persistEndedGame(newGame)
		console.log(`Game with ID ${id} ended successfully.`)
		return persistedGame
	}

	resign(id: string, username: string): Game | undefined {
		const game = this.findActiveGameById(id)
		if (game && (game.white === username || game.black === username)) {
			const gameState = game.black === username ? GameState.WHITE_WIN : GameState.BLACK_WIN
			const endedGame = this.endGame(game.id, gameState)
			return endedGame ? endedGame : undefined
		}
	}

	makeMove(id: string, username: string, move: Move): Move | undefined {
		const game = this.findActiveGameById(id)
		if (game) {
			const turnColor = this.getTurn(game.moves.length)
			const board = GameModel.boardAfterMoves(game.moves)
			const loggedIsValidMove = logFunctionExecution(isValidMove)
			const isValid = loggedIsValidMove(board, move)
			const turnPlayer = turnColor === PlayerColor.WHITE ? game.white : game.black
			if (turnPlayer === username && isValid) {
				this.registerMove(game, move)
			}
			return move
		}
	}

	makeMoveWithoutAuth(id: string, move: Move) {
		const game = this.findActiveGameById(id)
		if (game) {
			const board = GameModel.boardAfterMoves(game.moves)
			const loggedIsValidMove = logFunctionExecution(isValidMove)
			const isValid = loggedIsValidMove(board, move)
			if (isValid) {
				this.registerMove(game, move)
			}
		}
	}
	private getTurn(movesLength: number): PlayerColor {
		return movesLength % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK
	}

	private registerMove(game: Game, move: Move): void {
		if (!game) return
		const newGame = { ...game }
		const board = GameModel.boardAfterMoves([...newGame.moves, move])
		newGame.moves.push(move)
		const gameState = getGameState(this.getTurn(newGame.moves.length), board)
		if (gameState === GameState.STARTED) {
			this.persistActiveGame(newGame)
		} else if (gameState === GameState.DRAW || gameState === GameState.WHITE_WIN || gameState === GameState.BLACK_WIN) {
			this.endGame(newGame.id, gameState) //calls persistEndedGame
		}
	}
}
