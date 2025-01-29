export function log(message: string, data?: unknown) {
	console.log(`[${new Date().toISOString()}] ${message}`, data)
}
