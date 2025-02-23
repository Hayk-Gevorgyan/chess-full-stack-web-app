import { BaseContext } from "@apollo/server"
import { IUserModel } from "../models/UserModel"
import { User } from "../types/types"
import { Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { AuthPayload } from "./schema/resolvers/resolvers"

export interface AuthContext extends BaseContext {
	user?: User
	newToken?: string
}

export default class AuthController {
	private static readonly JWT_SECRET = "very secret token"
	private static readonly EXPIRATION_TIME = "1M"
	private userModel: IUserModel
	private static _instance: AuthController | undefined = undefined

	constructor(userModel: IUserModel) {
		this.userModel = userModel
		if (AuthController._instance) {
			return AuthController._instance
		}
		AuthController._instance = this
		return AuthController._instance
	}

	signToken(user: User) {
		return jwt.sign({ username: user.username }, AuthController.JWT_SECRET, { expiresIn: AuthController.EXPIRATION_TIME })
	}

	/**
	 * Helper function to extract and verify the JWT token from an HTTP request or
	 * WebSocket connection parameters.
	 *
	 * @param req - The Express request, if available.
	 * @param connectionParams - The connection parameters from the WS connection.
	 * @returns An object containing a `user` property if token is valid.
	 */
	getAuthContext({ req, res, connectionParams }: { req?: Request; res?: Response; connectionParams?: Record<string, any> }): AuthContext {
		let token: string | undefined | null

		if (req) {
			// For HTTP requests
			token = req.headers["x-access-token"] as string | undefined | null
			const { operationName } = req.body
			if (operationName.toLowerCase() === "signup" || operationName.toLowerCase() === "login") return {}
		} else if (connectionParams) {
			// For WebSocket connection params (subscriptions)
			token = connectionParams["x-access-token"] as string | undefined | null
		}

		let user: User | undefined
		let newToken: string | undefined

		if (token) {
			// Remove any surrounding quotes from the token if present
			token = token.replace(/^"(.*)"$/, "$1")

			try {
				const decoded = jwt.verify(token, AuthController.JWT_SECRET) as JwtPayload
				console.log("decoded", decoded)
				user = { username: decoded.username as string }
			} catch (error) {
				if (error instanceof jwt.TokenExpiredError) {
					console.warn("Token expired, issuing new one...")

					const decoded = jwt.decode(token) as JwtPayload
					if (!decoded?.exp) {
						throw new Error("Invalid token: missing expiration time")
					}

					const now = Math.floor(Date.now() / 1000)
					const expiredAgo = now - decoded.exp

					if (expiredAgo > 3600) {
						// More than 1 hour since expiration
						console.error("Token expired for too long. Please log in again.")
					}

					if (decoded?.username) {
						user = { username: decoded.username }

						// Generate a new token
						newToken = this.signToken({ username: user.username })

						// Only set the header if we're in an HTTP request (i.e. res is available)
						if (res) {
							console.log("refresh token set", newToken)
							res.setHeader("x-refresh-token", newToken)
						}
					}
				} else {
					console.error("JWT verification error:")
				}
			}
		}

		return { user }
	}

	async signup(username: string, password: string, authPayload: AuthPayload) {
		// Check if user already exists
		if (await this.userModel.findUser(username)) {
			authPayload.error = "Username already exists"
			return authPayload
		}

		// Create user
		const user = await this.userModel.addUser(username, password)

		// Sign a JWT token
		const token = this.signToken(user)

		console.log("token", token)

		authPayload.message = "User created successfully"
		authPayload.username = user.username
		authPayload.token = token

		return authPayload
	}

	async login(username: string, password: string, authPayload: AuthPayload) {
		const user = await this.userModel.findUser(username)
		if (!user) {
			authPayload.error = "Invalid credentials"
			return authPayload
		}

		// Validate password (assuming userModel.validatePassword handles hashing)
		const isValid = await this.userModel.validatePassword(password, user.password)
		if (!isValid) {
			authPayload.error = "Invalid credentials"
			return authPayload
		}

		// console.log("Signing payload:", { id: user.id, username: user.username })
		const token = this.signToken(user)

		console.log("token", token)

		authPayload.message = "Login successful"
		authPayload.username = user.username
		authPayload.token = token

		return authPayload
	}
}
