import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB_NAME || "chess"

export default async function connectMongoDb() {
	if (!uri) {
		console.error("MONGODB_URI environment variable must be set.")
	}

	try {
		const client = new MongoClient(uri)

		const db = client.db(dbName)
		console.log("Connected to MongoDB")
		return db
	} catch (error) {
		console.error("Error connecting to MongoDB:", error)
	}
}
