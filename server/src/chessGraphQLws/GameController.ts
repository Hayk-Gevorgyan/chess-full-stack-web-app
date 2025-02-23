import { GraphQLError } from "graphql"
import { IGameModel } from "../models/GameModel"
import { Move } from "../types/types"
import pubSub from "./pubsub"
import { ReconnectPayload } from "./schema/resolvers/resolvers"

const GAME_UPDATED = "GAME_UPDATED"

export default class GameController {
	private static _instance: GameController | undefined = undefined
	private gameModel: IGameModel
	private disconnectedPlayers: Map<string, NodeJS.Timeout>

	constructor(gameModel: IGameModel) {
		this.gameModel = gameModel
		this.disconnectedPlayers = new Map<string, NodeJS.Timeout>()
		if (GameController._instance) {
			return GameController._instance
		}
		GameController._instance = this
		return GameController._instance
	}

	async findGameById(id: string, username: string) {
		const activeGame = await this.gameModel.findActiveGameById(id)

		if (activeGame && (activeGame.white === username || activeGame.black === username)) {
			return activeGame
		} else {
			return this.gameModel.findEndedGameById(id)
		}
	}

	async findAllGamesByUsername(username: string) {
		return this.gameModel.findAllEndedGamesByUsername(username)
	}

	async reconnectToGame(reconnectPayload: ReconnectPayload) {
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

	async startGame(username: string) {
		const { id, game } = await this.gameModel.handleStartGame(username)
		console.log("game start result", { id, game })
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

	async makeMove(username: string, move: Move) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		console.log("make move id:", id, "move:", move, "username:", username)
		const game = await this.gameModel.handleMakeMove(id, username, move)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	async resign(username: string) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		console.log("resign id:", id, "username:", username)
		const game = await this.gameModel.handleResign(username)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	async offerDraw(username: string) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		console.log("offer draw id:", id, "username:", username)
		const game = await this.gameModel.handleOfferDraw(id, username)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	async acceptDraw(username: string) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		console.log("accept draw id:", id)
		const game = await this.gameModel.handleAcceptDraw(id, username)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	async denyDraw(username: string) {
		const id = await this.gameModel.getActiveGameIdByUsername(username)
		if (!id) return null
		console.log("deny draw id:", id)
		const game = await this.gameModel.handleDenyDraw(id, username)
		pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
	}

	async subscribeToGameUpdated(username: string) {
		const id = this.gameModel.isPlayerWaiting(username)

		if (id) {
			console.log(username, "subscribed to", id)
			return pubSub.asyncIterableIterator(`${GAME_UPDATED}_${id}`)
		} else {
			const game = await this.gameModel.findActiveGameByUsername(username)
			if (!game) {
				throw new GraphQLError("No active game found for this user.", {
					extensions: { code: "GAME_NOT_FOUND" },
				})
			}
			console.log(username, "subscribed to", game.id)
			return pubSub.asyncIterableIterator(`${GAME_UPDATED}_${game.id}`)
		}
	}

	reconnectPlayer(username: string) {
		const timeoutId = this.disconnectedPlayers.get(username)
		if (timeoutId) {
			clearTimeout(timeoutId)
			this.disconnectedPlayers.delete(username)
		} else {
			console.log("player was not disconnected")
		}
	}

	disconnectPlayer(username: string) {
		this.disconnectedPlayers.set(
			username,
			setTimeout(() => {
				this.resign(username)
			}, 6000)
		)
	}

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
