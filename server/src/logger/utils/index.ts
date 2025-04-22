import { OperationTypeNode } from "graphql"
import { Header } from "har-format"
import { Request, Response } from "express"
import {
	LogEntry,
	HTTPEntryRequest,
	GQLEntryRequest,
	BaseEntryResponse,
	Entry,
	GQLEntry,
	HTTPEntry,
	EntryResponse,
	EntryRequest,
	HTTPEntryResponse,
	GQLEntryResponse,
} from "../types"

function isGraphQLRequest(req: Request): boolean {
	return req.url.includes("/graphql") && req.method === "POST" && req.headers["content-type"] === "application/json"
}

function isGQLEntry(log: LogEntry): log is GQLEntry {
	if (log.type === "GQL") return true
	return false
}

function isHTTPEntry(log: LogEntry): log is HTTPEntry {
	if (log.type === "HTTP") return true
	return false
}

function parseHttpEntryRequest(req: Request): [HTTPEntryRequest, string] {
	let returnReq: HTTPEntryRequest
	try {
		const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
		const query: Record<string, any> = {}
		parsedUrl.searchParams.forEach((value, key) => {
			query[key] = value
		})

		returnReq = {
			url: req.url,
			headers: Object.entries(req.headers).map(
				([name, value]) => ({ name, value: Array.isArray(value) ? value.join(", ") : value } as Header)
			),
			method: req.method,
			name: parsedUrl.pathname,
			host: parsedUrl.host,
			pathname: parsedUrl.pathname,
			queryString: parsedUrl.search.substring(1),
			query: query,
			body: req.body,
		}
	} catch (error) {
		console.error("Error parsing URL:", error)
		returnReq = {
			url: req.url,
			headers: Object.entries(req.headers).map(
				([name, value]) => ({ name, value: Array.isArray(value) ? value.join(", ") : value } as Header)
			),
			method: req.method,
			name: "",
			host: req.headers.host,
			pathname: "",
			queryString: "",
			query: {},
			body: req.body,
		}
	}

	return [returnReq, returnReq.method]
}

function parseGraphQLEntryRequest(req: Request): GQLEntryRequest {
	try {
		const body = req.body
		let name: string
		let operations: string[] = []
		let operationType: OperationTypeNode | undefined
		let query: any = null
		let variables: any = null
		let batch: { length: number; count: number } | undefined

		name = body.operationName ? body.operationName : undefined
		operations = body.operationName ? [body.operationName] : []
		operationType = body.operationType
		query = body.query
		variables = body.variables

		return {
			url: req.url,
			headers: Object.entries(req.headers).map(
				([name, value]) => ({ name, value: Array.isArray(value) ? value.join(", ") : value } as Header)
			),
			method: req.method,
			name,
			operations,
			operationType: getOperationType(query),
			query,
			variables,
			batch: batch,
		}
	} catch (error) {
		console.error("Error parsing GraphQL request body:", error)
		return {
			url: req.url,
			headers: Object.entries(req.headers).map(
				([name, value]) => ({ name, value: Array.isArray(value) ? value.join(", ") : value } as Header)
			),
			method: req.method,
			operations: [],
			operationType: OperationTypeNode.QUERY,
			query: null,
			variables: null,
		}
	}
}

export function parseBaseEntryRequest(request: Request): [EntryRequest, string] {
	if (isGraphQLRequest(request)) {
		return [parseGraphQLEntryRequest(request), "GQL"]
	} else {
		return parseHttpEntryRequest(request)
	}
}

export function parseBaseEntryResponse(response: Response): BaseEntryResponse {
	return {
		status: response.statusCode,
		statusMessage: response.statusMessage || "",
		isError: response.statusCode >= 400,
		headers: Object.entries(response.getHeaders()).map(
			([name, value]) => ({ name, value: Array.isArray(value) ? value.join(", ") : value } as Header)
		),
		mimeType: (response.getHeader("content-type") as string) || "text/plain",
	}
}

export function parseEntryResponse(response: Response, responseBody?: any): EntryResponse {
	let body = responseBody

	try {
		body = typeof body !== "string" ? responseBody : JSON.parse(responseBody)
	} catch (e: any) {
		console.error("Error parsing response body:")
		body = responseBody
	}
	return {
		status: response.statusCode,
		statusMessage: response.statusMessage || "",
		isError: response.statusCode >= 400,
		headers: Object.entries(response.getHeaders()).map(
			([name, value]) => ({ name, value: Array.isArray(value) ? value.join(", ") : value } as Header)
		),
		mimeType: (response.getHeader("content-type") as string) || "text/plain",
		body,
	}
}

function getOperationType(queryString: string): OperationTypeNode {
	let type = OperationTypeNode.QUERY

	if (!queryString) {
		return type
	}

	for (let i = 0; i < queryString.length; i++) {
		if (queryString[i] === " ") {
			const operationName = queryString.substring(0, i)
			if (operationName === OperationTypeNode.MUTATION || operationName === OperationTypeNode.SUBSCRIPTION) {
				type = operationName
			}
		}
	}

	return type
}

export function parseLogToEntry(log: LogEntry): Entry | undefined {
	let entry = parseGQLEntry(log)

	if (!entry) return parseHTTPEntry(log)

	return entry
}

function parseGQLEntry(log: LogEntry): GQLEntry | undefined {
	if (log.time && isGQLEntry(log))
		return {
			id: log.id,
			type: "GQL",
			time: log.time,
			timestamp: log.timestamp,
			request: log.request as GQLEntryRequest,
			response: log.response as GQLEntryResponse,
		}
}

function parseHTTPEntry(log: LogEntry): HTTPEntry | undefined {
	if (log.time) {
		return {
			id: log.id,
			type: log.type,
			time: log.time,
			timestamp: log.timestamp,
			request: log.request as HTTPEntryRequest,
			response: log.response as HTTPEntryResponse,
		}
	}
}
