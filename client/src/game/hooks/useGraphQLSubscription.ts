import { useEffect, useRef } from "react"
import { createClient, Client, ClientOptions } from "graphql-ws"

interface UseGraphQLSubscriptionOptions<T> {
	url: string
	query: string
	variables?: Record<string, any>
	onMessage: (message: T) => void
	clientOptions?: Partial<ClientOptions>
}

export function useGraphQLSubscription<T>({ url, query, variables, onMessage, clientOptions }: UseGraphQLSubscriptionOptions<T>) {
	const clientRef = useRef<Client | null>(null)

	useEffect(() => {
		const client = createClient({
			url,
			on: {
				connected: () => {
					console.log("GraphQL subscription WebSocket connected")
				},
				closed: () => {
					console.log("GraphQL subscription WebSocket disconnected")
				},
			},
			...clientOptions,
		})
		clientRef.current = client

		const unsubscribe = client.subscribe<T>(
			{ query, variables },
			{
				next: (data) => {
					const message = data.data
					if (message) onMessage(message)
				},
				error: (err) => console.error("GraphQL subscription error:", err),
				complete: () => console.log("GraphQL subscription completed"),
			}
		)

		return () => {
			unsubscribe()
			clientRef.current?.dispose()
			clientRef.current = null
			console.log("GraphQL subscription WebSocket disconnected")
		}
	}, [url, query, variables, onMessage, clientOptions])
}
