// models/MongoUserModel.ts
import { Db, Collection } from "mongodb"
import bcrypt from "bcryptjs"
import { UserWithPassword } from "../types/types"

export interface IUserModel {
	findUser: (username: string) => Promise<UserWithPassword | null>
	addUser: (username: string, password: string) => Promise<UserWithPassword>
	validatePassword: (password: string, hashedPassword: string) => Promise<boolean>
}

const bycryptSaltRounds = process.env.BCRYPT_SALT_ROUNDS || "10"

export default class UserModel implements IUserModel {
	private usersCollection: Collection<UserWithPassword>
	saltRounds: number = parseInt(bycryptSaltRounds, 10)

	constructor(db: Db) {
		console.log("mongodb users collection")
		this.usersCollection = db.collection("users")
	}

	async addUser(username: string, password: string): Promise<UserWithPassword> {
		console.log("[mongo add user call]", { username, password })
		const hashedPassword = await bcrypt.hash(password, this.saltRounds)
		// Create a user object without the id so that MongoDB generates _id.
		const user = { username, password: hashedPassword }
		const result = await this.usersCollection.insertOne(user)
		// Return the inserted document with the generated id.
		console.log("[add user result user]", user)

		return { id: result.insertedId.toHexString(), ...user }
	}

	async findUser(username: string): Promise<UserWithPassword | null> {
		const user = await this.usersCollection.findOne({ username })
		if (user && !(user as any).id && (user as any)._id) {
			// Convert MongoDB _id to our id property
			;(user as any).id = (user as any)._id.toHexString()
		}
		return user
	}

	async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
		return bcrypt.compare(password, hashedPassword)
	}
}
