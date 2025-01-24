import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import { User } from "../types/types"

dotenv.config()
export default class UserModel {
	users: User[]
	constructor() {
		this.users = []
	}
	saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10)

	async addUser(username: string, password: string) {
		const hashedPassword = await bcrypt.hash(password, this.saltRounds)
		const user = { id: this.users.length, username, password: hashedPassword }
		this.users.push(user)
		return user
	}

	async findUser(username: string) {
		return this.users.find((user) => user.username === username)
	}

	async validatePassword(password: string, hashedPassword: string) {
		return bcrypt.compare(password, hashedPassword)
	}
}
