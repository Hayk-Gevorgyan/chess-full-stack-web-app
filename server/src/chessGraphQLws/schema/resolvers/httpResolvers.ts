// src/graphql/resolvers/httpResolvers.ts
import { Game, Move } from "../../../types/types"
import { AuthContext } from "../../controllers/AuthController"
import { authController, gameController } from "../../../../index"

export interface AuthPayload {
	error?: string
	message?: string
	username?: string
	token?: string
}

export interface AuthenticatePayload {
	error?: string
	message?: string
	username?: string
	token?: string
	game?: Game
}

const httpResolvers = {
	Query: {
		game: async (_: any, { id }: { id: string }, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			return await gameController.findGameByIdAndUsername(id, username)
		},
		endedGame: async (_: any, { id }: { id: string }, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			return await gameController.findEndedGameById(id)
		},
		endedGames: async (_: any, { username: profileUsername }: { username?: string }, context: AuthContext) => {
			const username = profileUsername ? profileUsername : context.user?.username
			if (!username) return null
			return gameController.findAllGamesByUsername(username)
		},
	},
	Mutation: {
		authenticate: async (_: any, __: any, context: AuthContext): Promise<AuthenticatePayload> => {
			const reconnectPayload: AuthenticatePayload = {}
			const username = context.user?.username
			if (!username) {
				reconnectPayload.error = "User not authenticated"
			} else {
				reconnectPayload.username = username
			}
			return gameController.reconnectToGame(reconnectPayload)
		},
		signup: async (_: any, { username, password }: { username: string; password: string }): Promise<AuthPayload> => {
			const authPayload: AuthPayload = {}
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
			gameController.disconnectFromGame(authPayload.username)
			return authPayload
		},
		startGame: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			const game = gameController.startGame(username)
			return game
		},
		makeMove: (_: any, { move }: { move: Move }, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			gameController.makeMove(username, move)
			return null
		},
		resign: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			gameController.resign(username)
			return null
		},
		offerDraw: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			gameController.offerDraw(username)
			return null
		},
		acceptDraw: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			gameController.acceptDraw(username)
			return null
		},
		denyDraw: (_: any, __: any, context: AuthContext) => {
			const username = context.user?.username
			if (!username) return null
			gameController.denyDraw(username)
			return null
		},
	},
}

export default httpResolvers
