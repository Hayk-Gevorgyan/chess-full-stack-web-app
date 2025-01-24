import { PubSub } from "graphql-subscriptions"
import { Move } from "../../types/types"
import GameModel from "../../models/GameModel"

const pubSub = new PubSub()
const GAME_UPDATED = "GAME_UPDATED"
const gameModel = new GameModel()

const resolvers = {
	Query: {
		game: (_: any, { id }: { id: string }) => {
			console.log("game with id", id)
			const activeGame = gameModel.findActiveGameById(id)

			return activeGame ? activeGame : gameModel.findEndedGameById(id)
		},
		endedGames: (_: any, { username }: { username: string }) => {
			console.log("ended games for", username)
			return gameModel.findAllEndedGamesByUsername(username)
		},
	},
	Mutation: {
		startGame: (_: any, { username }: { username: string }) => {
			console.log("start game for", username)
			const { id, game } = gameModel.handleStartGame(username)
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
		},
		makeMove: (_: any, { id, move, username }: { id: string; move: Move; username: string }) => {
			console.log("make move id:", id, "move:", move, "username:", username)
			const game = gameModel.handleMakeMove(id, username, move)
			pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
		},
		resign: (_: any, { id, username }: { id: string; username: string }) => {
			console.log("resign id:", id, "username:", username)
			const game = gameModel.handleResign(id, username)
			pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
		},
		offerDraw: (_: any, { id, username }: { id: string; username: string }) => {
			console.log("offer draw id:", id)
			const game = gameModel.handleOfferDraw(id, username)
			pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
		},
		acceptDraw: (_: any, { id, username }: { id: string; username: string }) => {
			console.log("accept draw id:", id)
			const game = gameModel.handleAcceptDraw(id, username)
			pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
		},
		denyDraw: (_: any, { id, username }: { id: string; username: string }) => {
			console.log("deny draw id:", id)
			const game = gameModel.handleDenyDraw(id, username)
			pubSub.publish(`${GAME_UPDATED}_${id}`, { gameUpdated: game })
		},
	},
	Subscription: {
		gameUpdated: {
			subscribe: async (_: any, { id, username }: { id: string; username: string }) => {
				console.log(username, "subscribed to", id)
				return pubSub.asyncIterableIterator(`${GAME_UPDATED}_${id}`)
			},
		},
	},
}

export default resolvers
