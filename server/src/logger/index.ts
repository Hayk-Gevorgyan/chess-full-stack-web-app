import { NextFunction, Request, Response } from "express"
import { LogEntry, Entry, EntryRequest, EntryResponse } from "./types"
import { parseBaseEntryRequest, parseEntryResponse, parseLogToEntry } from "./utils"
import { v4 as uuidv4 } from "uuid"
import util from "util"

const Logger = {
	_logs: new Map<string, LogEntry>(),
	_isCollectLogs: false,

	startLogging: (requestId: string, req: Request) => {
		const timestamp = Date.now()
		const [request, type]: [EntryRequest, string] = parseBaseEntryRequest(req)

		Logger._logs.set(requestId, {
			id: requestId,
			type,
			timestamp,
			request,
		})
		console.log("request by id", requestId, "started")
	},

	completeLogging: (requestId: string, res: Response, responseBody: any) => {
		const logEntry = Logger._logs.get(requestId)

		const response: EntryResponse = parseEntryResponse(res, responseBody)
		if (logEntry) {
			logEntry.response = response
			logEntry.time = Date.now() - logEntry.timestamp
		}
		console.log("request by id", requestId, "finished")
		console.log(util.inspect(Logger._logs.get(requestId), { depth: 3 }))
	},

	getLogs: (): Entry[] => {
		const entries: Entry[] = []

		Logger._logs.forEach((log) => {
			const entry = parseLogToEntry(log)
			if (entry) {
				entries.push(entry)
			}
		})

		return entries
	},

	deleteLogs: () => {
		Logger._logs.clear()
		console.log("Logs deleted", Logger._logs)
	},

	middleware: (req: Request, res: Response, next: NextFunction) => {
		if (req.url.includes("/connect-logs")) {
			console.log("Collecting logs...")
			Logger._isCollectLogs = true
			res.append("connect-logs", "true")
			res.send("Logs are being collected")
			next()
			return
		} else if (req.url.includes("/get-logs")) {
			console.log("Getting logs...")
			const logs: Entry[] = Logger.getLogs()
			res.append("connect-logs", "true")
			res.send(logs)
			next()
			return
		} else if (req.url.includes("/disconnect-logs")) {
			console.log("Stopping collecting logs...")
			Logger._isCollectLogs = false
			Logger.deleteLogs()
			res.append("connect-logs", "false")
			res.send("Logs collection stopped")
			next()
			return
		}

		if (!Logger._isCollectLogs) {
			next()
			return
		}

		const requestId = uuidv4()

		Logger.startLogging(requestId, req)

		const originalSend = res.send.bind(res)
		let responseBody: any
		res.send = (body: any) => {
			responseBody = body
			return originalSend(body)
		}

		next()

		res.on("finish", () => {
			Logger.completeLogging(requestId, res, responseBody)
		})
	},
}

export default Logger
