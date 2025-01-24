import { createClient } from "graphql-ws"
import WebSocket from "ws"

// Helper to log messages with timestamps
export const log = (message: string, data?: unknown) => {
	console.log(`[${new Date().toISOString()}] ${message}`, data)
}

// Function to send a GraphQL query or mutation
async function sendGraphQLRequest(url: string, query: string, variables?: Record<string, any>, headers?: Record<string, string>) {
	log("Sending GraphQL Request", { url, query, variables })

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
			body: JSON.stringify({ query, variables }),
		})

		const result = await response.json()
		log("GraphQL Response", result)
		if (result.data) {
			log("GraphQL Data", result.data)
		} else {
			log("GraphQL Error", result.error)
		}
		return result
	} catch (error) {
		log("Error in GraphQL Request", error)
	}
}

// Function to handle GraphQL subscriptions
function startGraphQLSubscription<T>(
	url: string,
	query: string,
	variables: Record<string, any>,
	headers?: Record<string, string>,
	onData?: (data: T) => void
) {
	log("Starting GraphQL Subscription", { query, variables })

	const client = createClient({
		url,
		webSocketImpl: WebSocket,
		connectionParams: headers ? () => headers : undefined,
	})

	const unsubscribe = client.subscribe<T>(
		{ query, variables },
		{
			next: (data) => {
				log(`Subscription Data for ${variables}`, data)
				if (data.data && onData) {
					onData(data.data)
				}
			},
			error: (error) => log(`Subscription Error for ${variables}`, error),
			complete: () => log("Subscription Completed"),
		}
	)

	// Automatically disconnect after 1 minute
	setTimeout(() => {
		log("Unsubscribing from GraphQL Subscription")
		unsubscribe()
		client.dispose()
	}, 60000)
}

export { sendGraphQLRequest, startGraphQLSubscription }
