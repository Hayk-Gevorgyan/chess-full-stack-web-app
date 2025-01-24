import express, { Request, Response } from "express"
import cors from "cors"
import { signup, login, logout } from "./controllers/authController"

export default function createExpressApp() {
	const app = express()
	app.use([express.json(), cors({ origin: "*" })])

	app.post("/signup", (req: Request, res: Response) => {
		signup(req, res)
	})
	app.post("/login", (req: Request, res: Response) => {
		login(req, res)
	})
	app.post("/logout", (req: Request, res: Response) => {
		logout(req, res)
	})

	return app
}
