import { IGameModel } from "../../models/GameModel"
import { Move } from "../../types/types"
import pubSub from "../pubsub/pubsub"
import { AuthenticatePayload } from "../schema/resolvers/httpResolvers"

const GAME_UPDATED = "GAME_UPDATED"

export default class GameController {
	private static _instance: GameController | undefined = undefined
	private gameModel: IGameModel
	private disconnectedPlayers: Map<string, NodeJS.Timeout>

	/**
	 * Creates a new GameController instance or returns the existing one.
	 * @param gameModel - The game model to be used by the controller.
	 * @returns The GameController instance.
	 */
	constructor(gameModel: IGameModel) {
		this.gameModel = gameModel
		this.disconnectedPlayers = new Map<string, NodeJS.Timeout>()
		if (GameController._instance) {
			return GameController._instance
		}
		GameController._instance = this
		return GameController._instance
	}

	/**
	 * Finds a game by its ID and checks if the user is a participant.
	 * @param id - The ID of the game to find.
	 * @param username - The username of the player.
	 * @returns The active game if the user is a participant, or the ended game otherwise.
	 */
	async findGameById(id: string, username: string) {
		const activeGame = await this.gameModel.findActiveGameById(id)

		if (activeGame && (activeGame.white === username || activeGame.black === username)) {
			return activeGame
		} else {
			return this.gameModel.findEndedGameById(id)
		}
	}

	/**
	 * Finds all ended games for a given username.
	 * @param username - The username of the player.
	 * @returns An array of ended games for the specified user.
	 */
	async findAllGamesByUsername(username: string) {
		return this.gameModel.findAllEndedGamesByUsername(username)
	}

	/**
	 * Attempts to reconnect a player to their active game.
	 * @param reconnectPayload - The payload containing authentication information.
	 * @returns The updated reconnect payload, potentially including game information.
	 */
	async reconnectToGame(reconnectPayload: AuthenticatePayload) {
		const error = reconnectPayload.error

		if (error) {
			return reconnectPayload
		}

		const username = reconnectPayload.username

		if (!username) return reconnectPayload
		const game = await this.gameModel.findActiveGameByUsername(username)

		if (!game) {
			reconnectPayload.message = "Reconnected successfully, not in active game"
		} else {
			reconnectPayload.game = game
			pubSub.publish(`${GAME_UPDATED}_${game.id}`, { gameUpdated: game })
			this.reconnectPlayer(username)
		}

		return reconnectPayload
	}

	/**
	 * Starts a new game for the given username.
	 * @param username - The username of the player starting the game.
	 * @returns An object containing the game ID and potentially the game object.
	 */
	async startGame(username: string) {
		const { id, game } = await this.gameModel.handleStartGame(username)
		if (!game) {
			return { id }
		} else {
			pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
			return {
				id,
				game,
			}
		}
	}

	/**
	 * Handles a move made by a player in their active game.
	 * @param username - The username of the player making the move.
	 * @param move - The move to be made.
	 * @returns null if no active game is found, otherwise undefined.
	 */
	async makeMove(username: string, move: Move) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		const game = await this.gameModel.handleMakeMove(id, username, move)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	/**
	 * Handles a player resigning from their active game.
	 * @param username - The username of the player resigning.
	 * @returns null if no active game is found, otherwise undefined.
	 */
	async resign(username: string) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		const game = await this.gameModel.handleResign(username)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	/**
	 * Handles a player offering a draw in their active game.
	 * @param username - The username of the player offering the draw.
	 * @returns null if no active game is found, otherwise undefined.
	 */
	async offerDraw(username: string) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		const game = await this.gameModel.handleOfferDraw(id, username)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	/**
	 * Handles a player accepting a draw offer in their active game.
	 * @param username - The username of the player accepting the draw.
	 * @returns null if no active game is found, otherwise undefined.
	 */
	async acceptDraw(username: string) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		const game = await this.gameModel.handleAcceptDraw(id, username)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	/**
	 * Handles a player denying a draw offer in their active game.
	 * @param username - The username of the player denying the draw.
	 * @returns null if no active game is found, otherwise undefined.
	 */
	async denyDraw(username: string) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		const game = await this.gameModel.handleDenyDraw(id, username)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	/**
	 * Subscribes a player to updates for their active or waiting game.
	 * @param username - The username of the player to subscribe.
	 * @returns An AsyncIterator for game updates, or undefined if no game is found.
	 */
	async subscribeToGameUpdated(username: string) {
		const id = this.gameModel.isPlayerWaiting(username)

		if (id) {
			return pubSub.asyncIterableIterator(`${GAME_UPDATED}_${id}`)
		} else {
			const game = await this.gameModel.findActiveGameByUsername(username)
			if (!game) {
				console.error("No active game found for this user.", {
					extensions: { code: "GAME_NOT_FOUND" },
				})
				return
			}
			return pubSub.asyncIterableIterator(`${GAME_UPDATED}_${game.id}`)
		}
	}

	/**
	 * Handles the reconnection of a player, clearing any disconnect timeout.
	 * @param username - The username of the player reconnecting.
	 */
	reconnectPlayer(username: string) {
		const timeoutId = this.disconnectedPlayers.get(username)
		if (timeoutId) {
			clearTimeout(timeoutId)
			this.disconnectedPlayers.delete(username)
		}
	}

	/**
	 * Sets a timeout for a disconnected player, after which they will resign.
	 * @param username - The username of the disconnected player.
	 */
	disconnectPlayer(username: string) {
		this.disconnectedPlayers.set(
			username,
			setTimeout(() => {
				this.resign(username)
			}, 6000)
		)
	}

	/**
	 * Handles a player disconnecting from their game or waiting queue.
	 * @param username - The username of the disconnecting player.
	 */
	async disconnectFromGame(username: string) {
		const activeGame = await this.gameModel.findActiveGameByUsername(username)
		if (activeGame) {
			this.disconnectPlayer(username)
			return
		}

		const waitingGame = this.gameModel.isPlayerWaiting(username)
		if (waitingGame) {
			this.gameModel.removeWaitingPlayerByUsername(username)
			return
		}
	}
}
