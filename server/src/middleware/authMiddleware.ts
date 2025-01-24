// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(" ")[1]

	if (!token) {
		return res.status(401).json({ message: "Access denied" })
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET)
		req.body.user = decoded
		next()
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" })
	}
}
