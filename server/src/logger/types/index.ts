import type { OperationTypeNode } from "graphql"
import type { Header, Param } from "har-format"

type QueryValue = string | number | undefined | null | boolean | Array<QueryValue> | Record<string, any>
type QueryObject = Record<string, QueryValue | QueryValue[]>

export interface LogEntry {
	id: string
	type: string
	time?: number
	timestamp: number
	request: EntryRequest
	response?: EntryResponse
}

export interface BaseEntryRequest {
	url: string
	headers: Header[]
	preflightHeaders?: Header[]
	mimeType?: string
	method: string
}

export interface BaseEntryResponse {
	status: number
	statusMessage?: string
	isError: boolean
	headers: Header[]
	preflightHeaders?: Header[]
	mimeType: string
}

export interface BaseEntry {
	id: string
	type: string
	time: number
	timestamp: number
	request: BaseEntryRequest
	response: BaseEntryResponse
}

export interface HTTPEntryRequest extends BaseEntryRequest {
	name: string
	host?: string
	pathname: string
	queryString: string
	query: QueryObject
	body?: any
	params?: Param[]
}

export interface HTTPEntryResponse extends BaseEntryResponse {
	body?: any
}

export interface HTTPEntry extends BaseEntry {
	request: HTTPEntryRequest
	response: HTTPEntryResponse
}

export interface GQLEntryRequest extends BaseEntryRequest {
	name?: string
	operations: string[]
	operationType: OperationTypeNode
	query: any
	variables: any
	batch?: {
		length: number
		count: number
	}
}

export interface GQLEntryResponse extends BaseEntryResponse {
	body?: { data?: any; errors?: any }
}

export interface GQLEntry extends BaseEntry {
	request: GQLEntryRequest
	response: GQLEntryResponse
}

export type Entry = HTTPEntry | GQLEntry
export type EntryRequest = GQLEntryRequest | HTTPEntryRequest
export type EntryResponse = GQLEntryResponse | HTTPEntryResponse
