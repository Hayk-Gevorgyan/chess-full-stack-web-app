import { Express } from "express"
import { ApolloServer, BaseContext } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { json } from "body-parser"
import { Server } from "http"
import { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"
import schema from "./schema/ChessGraphQLSchema"
import { GraphQLSchema } from "graphql"

export default class ChessGraphQLWSServer {
	private schema: GraphQLSchema
	private apolloServer: ApolloServer<BaseContext> | undefined
	private isConnected: boolean = false
	private wsServer: WebSocketServer | undefined

	constructor() {
		this.schema = schema
	}

	async connectApolloServer(app: Express) {
		this.apolloServer = new ApolloServer({ schema: this.schema })
		await this.apolloServer.start()
		app.use("/graphql", json(), expressMiddleware(this.apolloServer))
	}

	async disconnectApolloServer() {
		if (this.apolloServer && this.isConnected) {
			await this.apolloServer.stop()
		}
		this.apolloServer = undefined
		this.isConnected = false
	}

	async connect(path: string, httpServer: Server) {
		this.wsServer = new WebSocketServer({
			server: httpServer,
			path: path.startsWith("/") ? path : `/${path}`,
		})

		useServer({ schema: this.schema }, this.wsServer)

		this.isConnected = true
	}
}
