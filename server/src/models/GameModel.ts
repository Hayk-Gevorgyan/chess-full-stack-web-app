// models/GameModel.ts
import { Db, Collection } from "mongodb"
// import isValidMove, { getGameState } from "../chessValidation/isValidMove"
import { Game, Move, GameState, PlayerColor, Board } from "../types/types"
import { generateId } from "../utils/helperFunctions/idGenerator"
import { boardAfterMoves } from "../utils/helperFunctions/gameHelperFunctions"
import { IChessValidator } from "../chessValidation/ChessValidator"

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
}

export default class GameModel implements IGameModel {
	private gamesCollection: Collection<Game>
	private validator: IChessValidator
	// Waiting players are maintained in memory.
	private waitingPlayers: Map<string, string> = new Map<string, string>()

	constructor(db: Db, validator: IChessValidator) {
		this.gamesCollection = db.collection("games")
		this.validator = validator
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
			console.error(`User ${username} is already waiting for a game.`)
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

	/**
	 * @param id game id to be created
	 * @param param1 object containig the game participants` usernames
	 * @returns the created and persisted game object
	 * creates a game in DB and returns the game object
	 */
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
	 * @param game the game object where move will be registered
	 * @param move the move to be registered
	 * @returns the updated game parameter object after updating in DB
	 * Persists a move by computing the new moves array, board, and game state.
	 * Uses updateOne to update the document in the DB.
	 */
	private async registerMove(game: Game, move: Move): Promise<Game> {
		// Combine current moves with the new move.
		const newMoves = [...game.moves, move]
		// Compute board after new moves.
		const board: Board = boardAfterMoves(newMoves)
		// Determine whose turn it is (after the new move).
		const newTurn = newMoves.length % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK
		// Calculate new game state once.
		const gameState = this.validator.getGameState(newTurn, board)
		const updatedGame: Game = { ...game, moves: newMoves, state: gameState }
		// Persist the updated game.
		await this.gamesCollection.updateOne({ id: game.id }, { $set: updatedGame })
		return updatedGame
	}

	// ─── GAME MOVE/UPDATE LOGIC ────────────────────────────────────────────────

	/**
	 * @param gameId game id where the move registration will be handled
	 * @param username who moves
	 * @param move the move to be registered
	 * @returns active game if the game didn`t end after the move, ended game if the game ended after the move or null if the move was invalid
	 */
	async handleMakeMove(gameId: string, username: string, move: Move): Promise<Game | null> {
		if (await this.makeMove(gameId, username, move)) {
			const activeGame = await this.findActiveGameById(gameId)
			if (activeGame) return activeGame
			return this.findEndedGameById(gameId)
		}
		return null
	}

	/**
	 * @param gameId the game where the move is made
	 * @param username who made the move
	 * @param move the move to be made
	 * @returns the move if valid, otherwise null
	 */
	private async makeMove(gameId: string, username: string, move: Move): Promise<Move | null> {
		const game = await this.findActiveGameById(gameId)
		if (game) {
			const turnColor = game.moves.length % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK
			const board = boardAfterMoves(game.moves)
			if (!this.validator.validateMove(board, move)) {
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

	/**
	 * @param username who resigned
	 * @returns the ended game if resignition successful, otherwise null
	 */
	async handleResign(username: string): Promise<Game | null> {
		const game = await this.findActiveGameByUsername(username)
		if (game) {
			const gameState = game.black === username ? GameState.WHITE_WIN : GameState.BLACK_WIN
			return await this.endGame(game.id, gameState)
		}
		return null
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

	private async endGame(id: string, gameState: GameState): Promise<Game | null> {
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

	private addWaitingPlayer(username: string, newGameId: string): void {
		this.waitingPlayers.set(username, newGameId)
	}
}
