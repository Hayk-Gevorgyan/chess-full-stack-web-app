import { useEffect, useCallback, useMemo } from "react"
import { ChessServerEvent, GameState, Move } from "../../types/types"
import { log } from "../../../shared/utils/helperFunctions"
import { useAuthContext } from "../../../shared/hooks/useAuthContext"
import { createClient, ClientOptions } from "graphql-ws"
import {
	START_GAME_MUTATION,
	ACCEPT_DRAW_MUTATION,
	DENY_DRAW_MUTATION,
	MAKE_MOVE_MUTATION,
	OFFER_DRAW_MUTATION,
	RESIGN_MUTATION,
	GAME_UPDATED_SUBSCRIPTION,
} from "../queries"

export interface GameUpdatedData {
	gameUpdated: {
		id: string
		white: string
		black: string
		state: GameState
		moves: Move[]
		drawOffer: string | null | undefined
	}
}

export function useChessGQL({
	subscriptionVariables,
	onGameUpdatedData,
}: {
	subscriptionVariables: Record<string, any>
	onGameUpdatedData: (data: GameUpdatedData) => void
}) {
	const { serverUrl } = useAuthContext()

	const client = useMemo(() => {
		if (!serverUrl) return null
		const options: ClientOptions = {
			url: `${serverUrl}/graphql`,
			webSocketImpl: WebSocket,
		}
		return createClient(options)
	}, [serverUrl])

	const startSubscription = useCallback(() => {
		if (!client) {
			log("GraphQL Subscription Client is not initialized")
			return
		}

		log("Starting GraphQL Subscription", { query: GAME_UPDATED_SUBSCRIPTION, variables: subscriptionVariables })

		const unsubscribe = client.subscribe<GameUpdatedData>(
			{ query: GAME_UPDATED_SUBSCRIPTION, variables: subscriptionVariables },
			{
				next: (data) => {
					log("Subscription Data", data)
					if (data.data && onGameUpdatedData) {
						onGameUpdatedData(data.data)
					}
				},
				error: (error) => log("Subscription Error", error),
				complete: () => log("Subscription Completed"),
			}
		)

		return unsubscribe
	}, [client])

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

	return { sendMessage, startSubscription: startSubscription }
}
