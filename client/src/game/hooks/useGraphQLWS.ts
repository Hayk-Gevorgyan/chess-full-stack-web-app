import { useEffect, useCallback, useMemo } from "react"
import { ChessServerEvent } from "../types/types"
import { log } from "../../shared/providers/graphqlClient"
import { useAuthContext } from "../../shared/hooks/useAuthContext"
import { createClient, ClientOptions } from "graphql-ws"

const START_GAME_MUTATION = `#graphql
  mutation StartGame($username: String!) {
    startGame(username: $username) {
      id
      game {
        id
        white
        black
        moves {
          from
          to
          promotion
        }
        state
      }
    }
  }
`

const MAKE_MOVE_MUTATION = `#graphql
  mutation MakeMove($id: ID!, $move: MoveInput!, $username: String!) {
    makeMove(id: $id, move: $move, username: $username)
  }
`

const RESIGN_MUTATION = `#graphql
  mutation Resign($id: ID!, $username: String!) {
    resign(id: $id, username: $username)
  }
`

const OFFER_DRAW_MUTATION = `#graphql
  mutation OfferDraw($id: ID!, $username: String!) {
    offerDraw(id: $id, username: $username)
  }
`

const ACCEPT_DRAW_MUTATION = `#graphql
  mutation AcceptDraw($id: ID!, $username: String!) {
    acceptDraw(id: $id, username: $username)
  }
`

const DENY_DRAW_MUTATION = `#graphql
  mutation DenyDraw($id: ID!, $username: String!) {
    denyDraw(id: $id, username: $username)
  }
`

export default function useGraphQLWS() {
	const { serverUrl } = useAuthContext()

	// Create GraphQL WS client
	const client = useMemo(() => {
		if (!serverUrl) return null
		const options: ClientOptions = {
			url: `${serverUrl}/graphql`,
			webSocketImpl: WebSocket, // Ensure this is consistent across renders
			// connectionParams: {
			// 	// Example: Add auth headers or other params here
			// 	Authorization: `Bearer ${localStorage.getItem("authToken")}`,
			// },
		}
		return createClient(options)
	}, [serverUrl])

	// Function to start a subscription
	const startGraphQLSubscription = useCallback(
		<T>(query: string, variables: Record<string, any>, onData: (data: T) => void) => {
			if (!client) {
				log("GraphQL Subscription Client is not initialized")
				return
			}

			log("Starting GraphQL Subscription", { query, variables })

			const unsubscribe = client.subscribe<T>(
				{ query, variables },
				{
					next: (data) => {
						log("Subscription Data", data)
						if (data.data && onData) {
							onData(data.data)
						}
					},
					error: (error) => log("Subscription Error", error),
					complete: () => log("Subscription Completed"),
				}
			)

			return unsubscribe // Return the unsubscribe function for manual cleanup if needed
		},
		[client]
	)

	// Manage subscription lifecycle with useEffect
	useEffect(() => {
		if (!client) return

		return () => {
			log("Disposing GraphQL WS Client")
			client.dispose()
		}
	}, [client])

	const sendGraphQLRequest = useCallback(
		async (query: string, variables?: Record<string, any>, headers?: Record<string, string>) => {
			log("Sending GraphQL Request", { serverUrl, query, variables })

			if (!serverUrl) return

			try {
				const response = await fetch(`${serverUrl}/graphql`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...headers,
					},
					body: JSON.stringify({ query, variables }),
				})

				const result = await response.json()
				log("GraphQL Response", result)
				return result
			} catch (error) {
				log("Error in GraphQL Request", error)
			}
		},
		[serverUrl]
	)

	const sendMessage = useCallback(
		({ event, data }: { event: ChessServerEvent; data?: any }) => {
			switch (event) {
				case ChessServerEvent.START_GAME: {
					const username = data?.username
					if (username) {
						return sendGraphQLRequest(START_GAME_MUTATION, { username })
					}
					break
				}
				case ChessServerEvent.MAKE_MOVE: {
					const { id, move, username } = data
					if (id && username && move) {
						return sendGraphQLRequest(MAKE_MOVE_MUTATION, { id, move, username })
					}
					break
				}
				case ChessServerEvent.RESIGN: {
					const { id, username } = data
					if (id && username) {
						return sendGraphQLRequest(RESIGN_MUTATION, { id, username })
					}
					break
				}
				case ChessServerEvent.OFFER_DRAW: {
					const { id, username } = data
					if (id && username) {
						return sendGraphQLRequest(OFFER_DRAW_MUTATION, { id, username })
					}
					break
				}
				case ChessServerEvent.ACCEPT_DRAW: {
					const { id, username } = data
					if (id && username) {
						return sendGraphQLRequest(ACCEPT_DRAW_MUTATION, { id, username })
					}
					break
				}
				case ChessServerEvent.DENY_DRAW: {
					const { id, username } = data
					if (id && username) {
						return sendGraphQLRequest(DENY_DRAW_MUTATION, { id, username })
					}
					break
				}
				default:
					log("Unknown Chess Event", event)
			}
		},
		[sendGraphQLRequest]
	)

	return { sendMessage, startGraphQLSubscription }
}
