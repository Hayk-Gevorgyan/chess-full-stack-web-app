import express from "express"
import cors from "cors"

/**
 * Creates and configures an Express app.
 * Registers JSON parsing, CORS, and authentication routes.
 */
export default function createExpressApp() {
	const app = express()
	app.use([express.json(), cors({ origin: "*" })])
	return app
}
