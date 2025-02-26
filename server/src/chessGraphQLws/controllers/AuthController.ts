import { BaseContext } from "@apollo/server"
import { IUserModel } from "../../models/UserModel"
import { User } from "../../types/types"
import { Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { AuthPayload } from "../schema/resolvers/httpResolvers"

export interface AuthContext extends BaseContext {
	user?: User
}

/**
 * AuthController manages user authentication, including token generation,
 * verification, and user signup/login operations.
 */
export default class AuthController {
	private static readonly JWT_SECRET = "very secret token"
	private static readonly EXPIRATION_TIME = "30d"
	private userModel: IUserModel
	private static _instance: AuthController | undefined = undefined

	/**
	 * Constructs a new AuthController instance. Implements the singleton pattern.
	 *
	 * @param userModel - An instance of IUserModel for user data management.
	 */
	constructor(userModel: IUserModel) {
		this.userModel = userModel
		if (AuthController._instance) {
			return AuthController._instance
		}
		AuthController._instance = this
		return AuthController._instance
	}

	/**
	 * Generates a JWT token for a given user.
	 *
	 * @param user - The user object containing username.
	 * @returns A JWT token string.
	 */
	signToken(user: User) {
		return jwt.sign({ username: user.username }, AuthController.JWT_SECRET, { expiresIn: AuthController.EXPIRATION_TIME })
	}

	/**
	 * Helper function to extract and verify the JWT token from an HTTP request or
	 * WebSocket connection parameters.
	 *
	 * @param req - The Express request, if available.
	 * @param connectionParams - The connection parameters from the WS connection.
	 * @param res - The Express response, if available for setting headers.
	 * @returns An object containing a `user` property if token is valid.
	 */
	async getAuthContext({
		req,
		res,
		connectionParams,
	}: {
		req?: Request
		res?: Response
		connectionParams?: Record<string, any>
	}): Promise<AuthContext> {
		let token: string | undefined | null

		if (req) {
			// For HTTP requests
			token = req.headers["x-access-token"] as string | undefined | null
			const { operationName } = req.body
			if (
				operationName.toLowerCase() === "signup" ||
				operationName.toLowerCase() === "login" ||
				operationName.toLowerCase() === "logout"
			)
				return {}
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
				user = { username: decoded.username as string }
			} catch (error) {
				if (error instanceof jwt.TokenExpiredError) {
					console.warn("Token expired, issuing new one...")

					const decoded = jwt.decode(token) as JwtPayload
					if (!decoded?.exp) {
						console.error("Invalid token: missing expiration time")
						return {}
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

	/**
	 * Handles user signup, creating a new user and generating a JWT token.
	 *
	 * @param username - The username of the new user.
	 * @param password - The password of the new user.
	 * @param authPayload - An object to hold the result of the signup operation.
	 * @returns An AuthPayload object containing the result of the signup.
	 */
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

		authPayload.message = "User created successfully"
		authPayload.username = user.username
		authPayload.token = token

		return authPayload
	}

	/**
	 * Handles user login, validating credentials and generating a JWT token.
	 *
	 * @param username - The username of the user.
	 * @param password - The password of the user.
	 * @param authPayload - An object to hold the result of the login operation.
	 * @returns An AuthPayload object containing the result of the login.
	 */
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

		const token = this.signToken(user)

		authPayload.message = "Login successful"
		authPayload.username = user.username
		authPayload.token = token

		return authPayload
	}
}
