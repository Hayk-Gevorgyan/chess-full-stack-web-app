import { Game, Move } from "../../../types/types"
import AuthController, { AuthContext } from "../../AuthController"
import { GraphQLError } from "graphql"
import GameController from "../../GameController"
import { authController, gameController } from "../../../../index"

export interface AuthPayload {
	error?: string
	message?: string
	username?: string
	token?: string
}

export interface ReconnectPayload {
	error?: string
	message?: string
	username?: string
	game?: Game
}

// const gameController = new GameController()
// const authController = new AuthController()

const resolvers = {
	Query: {
		game: (_: any, { id }: { id: string }, context: AuthContext) => {
			console.log("game with id", id)
			const username = context.user?.username

			if (!username) return null

			return gameController.findGameById(id, username)
		},
		endedGames: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			console.log("ended games for", username)
			return gameController.findAllGamesByUsername(username)
		},
	},
	Mutation: {
		reconnect: async (_: any, __: any, context: AuthContext): Promise<ReconnectPayload | null> => {
			const reconnectPayload: ReconnectPayload = {}

			const username = context.user?.username
			if (!username) {
				reconnectPayload.error = "User not authenticated"
			} else {
				reconnectPayload.username = username
			}

			console.log("reconnecting", username)

			return gameController.reconnectToGame(reconnectPayload)
		},
		signup: async (_: any, { username, password }: { username: string; password: string }): Promise<AuthPayload> => {
			const authPayload: AuthPayload = {}

			// Check if username and password provided
			if (!username || !password) {
				authPayload.error = "Username and password are required"
				return authPayload
			}

			return authController.signup(username, password, authPayload)
		},
		login: async (_: any, { username, password }: { username: string; password: string }): Promise<AuthPayload> => {
			const authPayload: AuthPayload = {}

			if (!username || !password) {
				authPayload.error = "Username and password are required"
				return authPayload
			}

			return authController.login(username, password, authPayload)
		},
		logout: async (_: any, __: any, context: AuthContext): Promise<AuthPayload> => {
			const authPayload: AuthPayload = {}

			if (!context.user) {
				authPayload.error = "Not authenticated"
				return authPayload
			}

			authPayload.message = "Logout successful"
			authPayload.username = context.user.username

			//remove from ongoing game
			console.log("disconnecting player from game")
			gameController.disconnectFromGame(authPayload.username)

			return authPayload
		},
		startGame: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null

			console.log("start game for", username)

			const game = gameController.startGame(username)
			const token = context.newToken

			if (token) {
				return { ...game, token }
			} else {
				return game
			}
		},
		makeMove: (_: any, { move }: { move: Move }, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null

			gameController.makeMove(username, move)

			const token = context.newToken

			if (token) {
				return token
			}
		},
		resign: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null

			gameController.resign(username)

			const token = context.newToken

			if (token) {
				return token
			}
		},
		offerDraw: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null

			gameController.offerDraw(username)

			const token = context.newToken

			if (token) {
				return token
			}
		},
		acceptDraw: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null

			gameController.acceptDraw(username)

			const token = context.newToken

			if (token) {
				return token
			}
		},
		denyDraw: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null

			gameController.denyDraw(username)

			const token = context.newToken

			if (token) {
				return token
			}
		},
	},
	Subscription: {
		gameUpdated: {
			subscribe: async (_: any, __: any, context: AuthContext) => {
				if (!context?.user) {
					throw new GraphQLError("You must be logged in to subscribe.", {
						extensions: { code: "UNAUTHENTICATED" },
					})
				}

				const username = context.user.username

				return gameController.subscribeToGameUpdated(username)
			},
		},
	},
}

export default resolvers
