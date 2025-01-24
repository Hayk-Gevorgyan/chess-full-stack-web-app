import createExpressApp from "./src/app"
import http from "http"
import ChessWebSocketServer from "./src/chessws/ChessWebSocketServer"
import dotenv from "dotenv"
import ChessGraphQLWSServer from "./src/chessGraphQLws/ChessGraphQLWSServer"

dotenv.config()
const app = createExpressApp()
const PORT = process.env.SERVER_PORT || 56789

const server = http.createServer(app)

server.listen(PORT, () => {
	const address = server.address()
	if (typeof address === "object" && address !== null) {
		console.log(`Server is running on http://localhost:${address.port}`)
	} else {
		console.error("Server is not running")
	}
})

//ChessGraphQLWSServer
const gqls = new ChessGraphQLWSServer()
gqls.connect("/graphql", server)
gqls.connectApolloServer(app)

//ChessWebSocketServer
// const wss = new ChessWebSocketServer()
// wss.connect(server)
