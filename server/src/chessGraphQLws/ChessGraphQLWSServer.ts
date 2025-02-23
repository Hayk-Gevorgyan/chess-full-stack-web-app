import { Express, Request, Response } from "express"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import express from "express"
import cors from "cors"
import { Server } from "http"
import { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"
import { httpSchema, subscriptionsSchema } from "./schema/ChessGraphQLSchema"
import { GraphQLSchema } from "graphql"
import AuthController, { AuthContext } from "./AuthController"
import GameController from "./GameController"
import { Db } from "mongodb"

/**
 * Class representing the GraphQL server (HTTP and subscriptions) with integrated authentication.
 */
export default class ChessGraphQLWSServer {
	private authController: AuthController
	private gameController: GameController
	private httpSchema: GraphQLSchema
	private subscriptionsSchema: GraphQLSchema
	private apolloServer: ApolloServer<AuthContext> | undefined
	private isConnected: boolean = false
	private wsServer: WebSocketServer | undefined

	constructor(authController: AuthController, gameController: GameController) {
		this.httpSchema = httpSchema
		this.subscriptionsSchema = subscriptionsSchema
		this.gameController = gameController
		this.authController = authController
	}

	/**
	 * Sets up the Apollo Server for HTTP queries and mutations,
	 * including context building for authentication.
	 */
	async connectApolloServer(app: Express) {
		this.apolloServer = new ApolloServer<AuthContext>({
			schema: this.httpSchema,
		})
		await this.apolloServer.start()
		const path = "/graphql"

		app.use(
			path,
			cors<cors.CorsRequest>({
				origin: "*",
				credentials: true,
				exposedHeaders: ["x-refresh-token"],
			}),
			express.json(),
			expressMiddleware(this.apolloServer, {
				context: async ({ req, res }: { req: Request; res: Response }) => this.authController.getAuthContext({ req, res }),
			})
		)
		console.log("connected apollo server to", path)
	}

	/**
	 * Stops the Apollo Server if connected.
	 */
	async disconnectApolloServer() {
		if (this.apolloServer && this.isConnected) {
			await this.apolloServer.stop()
		}
		this.apolloServer = undefined
		this.isConnected = false
	}

	/**
	 * Sets up the WebSocket server for GraphQL subscriptions,
	 * including authentication via connection parameters.
	 */
	async connect(path: string, httpServer: Server) {
		this.wsServer = new WebSocketServer({
			server: httpServer,
			path: path.startsWith("/") ? path : `/${path}`,
		})

		useServer(
			{
				schema: this.subscriptionsSchema,
				context: (ctx: any) => {
					return this.authController.getAuthContext({ connectionParams: ctx.connectionParams })
				},
				onConnect: (ctx) => {
					const { user } = this.authController.getAuthContext({ connectionParams: ctx.connectionParams })
					console.log("Client connected", { user })
					if (user) this.gameController.reconnectToGame({ username: user.username })
				},
				onClose: (ctx) => {
					const { user } = this.authController.getAuthContext({ connectionParams: ctx.connectionParams })
					console.log("Client disconnected", ctx.connectionParams)
					if (user) this.gameController.disconnectFromGame(user.username)
				},
			},
			this.wsServer
		)

		this.isConnected = true

		console.log("connected to", path)
	}
}
