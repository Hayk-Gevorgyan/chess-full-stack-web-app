import { Request, Response } from "express"
import UserModel from "../models/UserModel"

const userModel = new UserModel()

export const signup = async (req: Request, res: Response) => {
	const { username, password } = req.body

	console.log(`Signup attempt for username: ${username}`)

	if (!username || !password) {
		return res.status(400).json({ message: "Username and password are required" })
	}

	try {
		if (await userModel.findUser(username)) {
			console.log(`User ${username} already exists`)
			return res.status(400).json({ message: "Username already exists" })
		}

		const user = await userModel.addUser(username, password)
		console.log(`User ${username} signed up successfully`)

		res.status(201).json({
			message: "User created successfully",
			user: {
				id: user.id,
				username: user.username,
			},
		})
	} catch (error) {
		console.error("Error during signup:", error)
		res.status(500).json({ message: "An error occurred during signup" })
	}
}

export const login = async (req: Request, res: Response) => {
	const { username, password } = req.body

	if (!username || !password) {
		return res.status(400).json({ message: "Username and password are required" })
	}

	try {
		const user = await userModel.findUser(username)

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" })
		}

		const isPasswordValid = await userModel.validatePassword(password, user.password)

		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" })
		}

		console.log(`User ${username} logged in successfully`)

		res.status(200).json({
			message: "Login successful",
			user: {
				id: user.id,
				username: user.username,
			},
		})
	} catch (error) {
		console.error("Error during login:", error)
		res.status(500).json({ message: "An error occurred during login" })
	}
}

export const logout = async (req: Request, res: Response) => {
	const { username } = req.body

	if (!username) {
		return res.status(400).json({ message: "Username is required" })
	}

	try {
		const user = await userModel.findUser(username)

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" })
		}

		console.log(`User ${username} logged out successfully`)

		res.status(200).json({ message: "Logout successful" })
	} catch (error) {
		console.error("Error during logout:", error)
		res.status(500).json({ message: "An error occurred during logout" })
	}
}
