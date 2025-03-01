import express from "express"
import cors from "cors"
import http from "http"
import dotenv from "dotenv"
import connectMongoDb from "./src/mongoClient/mogoClient"

import ChessGraphQLWSServer from "./src/chessGraphQLws/server/ChessGraphQLWSServer"
import UserModel from "./src/models/UserModel"
import GameModel from "./src/models/GameModel"
import AuthController from "./src/chessGraphQLws/controllers/AuthController"
import GameController from "./src/chessGraphQLws/controllers/GameController"
import ChessValidator from "./src/chessValidation/ChessValidator"

dotenv.config()

const app = express()
app.use([express.json(), cors({ origin: "*" })])
const PORT = process.env.SERVER_PORT || 4000
const server = http.createServer(app)

server.listen(PORT, () => {
	const address = server.address()
	if (typeof address === "object" && address !== null) {
		console.log(`Server is running on http://localhost:${address.port}`)
	} else {
		console.error("Server is not running")
	}
})

let authController: AuthController
let gameController: GameController

/**
 * Initiates the server
 */
async function init() {
	const db = await connectMongoDb()
	if (!db) {
		console.error("Failed to connect to MongoDB. Exiting...")
		process.exit(1)
	}

	const chessValidator = new ChessValidator(true)

	// Instantiate models
	const userModel = new UserModel(db)
	const gameModel = new GameModel(db, chessValidator)

	// Instantiate controllers
	authController = new AuthController(userModel)
	gameController = new GameController(gameModel)

	// Start GraphQL WebSocket Server
	const gqls = new ChessGraphQLWSServer(authController, gameController)
	gqls.connect("/subscriptions", server)
	gqls.connectApolloServer(app)
}

init().catch(console.error)

// Export controllers for resolvers
export { authController, gameController }
