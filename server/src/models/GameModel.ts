// models/GameModel.ts
import { Db, Collection } from "mongodb"
import isValidMove, { getGameState } from "../chessValidation/chessValidator"
import { Game, Move, GameState, PlayerColor, Board } from "../types/types"
import { generateId, lnToCoordinates } from "../utils/helperFunctions"

export interface IGameModel {
	handleStartGame: (username: string) => Promise<{ id: string; game?: Game }>
	handleMakeMove: (gameId: string, username: string, move: Move) => Promise<Game | null>
	handleResign: (username: string) => Promise<Game | null>
	handleOfferDraw: (gameId: string, username: string) => Promise<Game | null>
	handleAcceptDraw: (gameId: string, username: string) => Promise<Game | null>
	handleDenyDraw: (gameId: string, username: string) => Promise<Game | null>
	findActiveGameById: (id: string) => Promise<Game | null>
	findActiveGameByUsername: (username: string) => Promise<Game | null>
	getActiveGameIdByUsername: (username: string) => Promise<string>
	findEndedGameById: (id: string) => Promise<Game | null>
	findAllEndedGamesByUsername: (username: string) => Promise<Game[]>
	isPlayerWaiting: (username: string) => string | undefined
	removeWaitingPlayerByUsername: (username: string) => void
	addWaitingPlayer: (username: string, newGameId: string) => void
	endGame: (id: string, gameState: GameState) => Promise<Game | null>
	resign: (username: string) => Promise<Game | null>
	makeMove: (id: string, username: string, move: Move) => Promise<Move | null>
}

export default class GameModel implements IGameModel {
	private gamesCollection: Collection<Game>
	// Waiting players are maintained in memory.
	private waitingPlayers: Map<string, string> = new Map<string, string>()

	constructor(db: Db) {
		this.gamesCollection = db.collection("games")
	}

	// ─── GAME START/WAITING LOGIC ──────────────────────────────────────────────

	async handleStartGame(username: string): Promise<{ id: string; game?: Game }> {
		// Check if user already has an active game.
		const activeGame = await this.findActiveGameByUsername(username)
		if (activeGame) {
			return { id: activeGame.id, game: activeGame }
		}

		// Prevent duplicate waiting.
		if (this.waitingPlayers.has(username)) {
			throw new Error(`User ${username} is already waiting for a game.`)
		}

		// Look for a waiting opponent.
		const waitingEntry = this.waitingPlayers.entries().next().value
		if (waitingEntry) {
			const [waitingUsername, gameId] = waitingEntry
			this.removeWaitingPlayerByUsername(waitingUsername)
			const game = await this.addGame(gameId, { username1: waitingUsername, username2: username })
			return { id: game.id, game }
		} else {
			// No waiting players – add current user to waiting list.
			const newGameId = generateId()
			this.addWaitingPlayer(username, newGameId)
			return { id: newGameId }
		}
	}

	private async addGame(id: string, { username1, username2 }: { username1: string; username2: string }): Promise<Game> {
		const game: Game = {
			id,
			white: username1,
			black: username2,
			moves: [],
			state: GameState.STARTED,
		}
		await this.gamesCollection.insertOne(game)
		return game
	}

	// ─── MOVE REGISTRATION ─────────────────────────────────────────────────────

	/**
	 * Persists a move by computing the new moves array, board, and game state.
	 * Uses updateOne to update the document in the DB.
	 */
	private async registerMove(game: Game, move: Move): Promise<Game> {
		// Combine current moves with the new move.
		const newMoves = [...game.moves, move]
		// Compute board after new moves.
		const board: Board = GameModel.boardAfterMoves(newMoves)
		// Determine whose turn it is (after the new move).
		const newTurn = newMoves.length % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK
		// Calculate new game state once.
		const gameState = getGameState(newTurn, board)
		const updatedGame: Game = { ...game, moves: newMoves, state: gameState }
		// Persist the updated game.
		await this.gamesCollection.updateOne({ id: game.id }, { $set: updatedGame })
		return updatedGame
	}

	// ─── GAME MOVE/UPDATE LOGIC ────────────────────────────────────────────────

	async handleMakeMove(gameId: string, username: string, move: Move): Promise<Game | null> {
		const game = await this.findActiveGameById(gameId)
		if (!game) return null

		// Validate move using current board state.
		const turnColor = game.moves.length % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK
		const board = GameModel.boardAfterMoves(game.moves)
		if (!isValidMove(board, move)) {
			return null
		}
		const turnPlayer = turnColor === PlayerColor.WHITE ? game.white : game.black
		if (turnPlayer !== username) {
			return null
		}

		// Register the move and persist updated game.
		await this.registerMove(game, move)
		// Return updated game: try active, otherwise ended.
		const updatedGame = await this.findActiveGameById(gameId)
		return updatedGame ? updatedGame : await this.findEndedGameById(gameId)
	}

	async makeMove(id: string, username: string, move: Move): Promise<Move | null> {
		const game = await this.findActiveGameById(id)
		if (game) {
			const turnColor = game.moves.length % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK
			const board = GameModel.boardAfterMoves(game.moves)
			if (!isValidMove(board, move)) {
				return null
			}
			const turnPlayer = turnColor === PlayerColor.WHITE ? game.white : game.black
			if (turnPlayer !== username) {
				return null
			}
			// Use the shared registerMove function.
			await this.registerMove(game, move)
			return move
		}
		return null
	}

	async handleResign(username: string): Promise<Game | null> {
		const game = await this.findActiveGameByUsername(username)
		if (game) {
			const gameState = game.black === username ? GameState.WHITE_WIN : GameState.BLACK_WIN
			return await this.endGame(game.id, gameState)
		}
		return null
	}

	async resign(username: string): Promise<Game | null> {
		return this.handleResign(username)
	}

	async handleOfferDraw(gameId: string, username: string): Promise<Game | null> {
		const game = await this.findActiveGameById(gameId)
		if (game) {
			game.drawOffer = username
			await this.gamesCollection.updateOne({ id: gameId }, { $set: game })
			return game
		} else {
			console.error(`No active game found with id ${gameId}`)
		}
		return null
	}

	async handleAcceptDraw(gameId: string, username: string): Promise<Game | null> {
		const game = await this.findActiveGameById(gameId)
		if (game) {
			if (game.drawOffer !== username) {
				game.drawOffer = undefined
				game.state = GameState.DRAW
				await this.gamesCollection.updateOne({ id: gameId }, { $set: game })
				return game
			}
		} else {
			console.error(`No active game found with id ${gameId}`)
		}
		return null
	}

	async handleDenyDraw(gameId: string, username: string): Promise<Game | null> {
		const game = await this.findActiveGameById(gameId)
		if (game) {
			if (game.drawOffer !== username) {
				game.drawOffer = undefined
				await this.gamesCollection.updateOne({ id: gameId }, { $set: game })
				return game
			}
		} else {
			console.error(`No active game found with id ${gameId}`)
		}
		return null
	}

	async endGame(id: string, gameState: GameState): Promise<Game | null> {
		const game = await this.findActiveGameById(id)
		if (!game) return null
		const updatedGame = { ...game, state: gameState }
		await this.gamesCollection.updateOne({ id }, { $set: updatedGame })
		return updatedGame
	}

	// ─── GAME RETRIEVAL METHODS ────────────────────────────────────────────────

	async findActiveGameById(id: string): Promise<Game | null> {
		return await this.gamesCollection.findOne({ id, state: GameState.STARTED })
	}

	async findActiveGameByUsername(username: string): Promise<Game | null> {
		return await this.gamesCollection.findOne({
			state: GameState.STARTED,
			$or: [{ white: username }, { black: username }],
		})
	}

	async getActiveGameIdByUsername(username: string): Promise<string> {
		const game = await this.findActiveGameByUsername(username)
		return game ? game.id : ""
	}

	async findEndedGameById(id: string): Promise<Game | null> {
		return await this.gamesCollection.findOne({ id, state: { $ne: GameState.STARTED } })
	}

	async findAllEndedGamesByUsername(username: string): Promise<Game[]> {
		return await this.gamesCollection
			.find({
				state: { $ne: GameState.STARTED },
				$or: [{ white: username }, { black: username }],
			})
			.toArray()
	}

	// ─── WAITING PLAYERS MANAGEMENT ───────────────────────────────────────────

	isPlayerWaiting(username: string): string | undefined {
		return this.waitingPlayers.get(username)
	}

	removeWaitingPlayerByUsername(username: string): void {
		this.waitingPlayers.delete(username)
	}

	addWaitingPlayer(username: string, newGameId: string): void {
		this.waitingPlayers.set(username, newGameId)
	}

	// ─── STATIC HELPER METHODS FOR BOARD STATE ───────────────────────────────

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

	static immitateBoardAfterMove(board: Board, move: Move): Board {
		const from = lnToCoordinates(move.from)
		const to = lnToCoordinates(move.to)
		if (!from || !to) throw new Error("Invalid move coordinates")
		const [fromX, fromY] = from
		const [toX, toY] = to
		const newBoard: Board = board.map((row) => row.slice())
		const piece = move.promotion ? move.promotion : board[fromY][fromX]
		newBoard[toY][toX] = piece
		newBoard[fromY][fromX] = null
		return newBoard
	}
}
