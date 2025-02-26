import { useCallback, useEffect } from "react"
import useChessMutations from "./useChessMutations"
import { ChessServerEvent, Move } from "../../../chessGame/types/types"
import { useSubscription } from "@apollo/client"
import { GAME_UPDATED_SUBSCRIPTION } from "../queries"
import { useLocalStorage } from "../../../shared/hooks/useLocalStorage"

export interface GameUpdatedVariables {
	id: string
}

function useChessApollo<TUpdateData>({
	onGameUpdatedData,
	isSubscribed,
}: {
	onGameUpdatedData: (data: TUpdateData) => void
	isSubscribed: boolean
}) {
	const { setItem: setToken } = useLocalStorage("token")
	const {
		startGame,
		makeMove,
		resign,
		offerDraw,
		acceptDraw,
		denyDraw,
		startGameLoading,
		startGameError,
		makeMoveLoading,
		makeMoveError,
		resignLoading,
		resignError,
		offerDrawLoading,
		offerDrawError,
		acceptDrawLoading,
		acceptDrawError,
		denyDrawLoading,
		denyDrawError,
		makeMoveInput,
	} = useChessMutations()

	const {
		data: gameUpdatedData,
		loading: gameUpdatedLoading,
		error: gameUpdatedError,
	} = useSubscription<TUpdateData>(GAME_UPDATED_SUBSCRIPTION, {
		skip: !isSubscribed,
	})

	useEffect(() => {
		if (startGameLoading) {
			console.log("start game loading")
		} else if (startGameError) {
			console.log("start game error", startGameError.message)
		}
	}, [startGameLoading, startGameError])

	useEffect(() => {
		if (makeMoveLoading) {
			console.log("make move loading")
		} else if (makeMoveError) {
			console.log("make move error", makeMoveError.message)
		}
	}, [makeMoveLoading, makeMoveError])

	useEffect(() => {
		if (resignLoading) {
			console.log("resign loading")
		} else if (resignError) {
			console.log("resign error", resignError.message)
		}
	}, [resignLoading, resignError])

	useEffect(() => {
		if (offerDrawLoading) {
			console.log("offer draw loading")
		} else if (offerDrawError) {
			console.log("offer draw error", offerDrawError.message)
		}
	}, [offerDrawLoading, offerDrawError])

	useEffect(() => {
		if (acceptDrawLoading) {
			console.log("accept draw loading")
		} else if (acceptDrawError) {
			console.log("accept draw error", acceptDrawError.message)
		}
	}, [acceptDrawLoading, acceptDrawError])

	useEffect(() => {
		if (denyDrawLoading) {
			console.log("accept draw loading")
		} else if (denyDrawError) {
			console.log("accept draw error", denyDrawError.message)
		}
	}, [denyDrawLoading, denyDrawError])

	useEffect(() => {
		if (gameUpdatedLoading) {
			console.log("game updated loading")
		} else if (gameUpdatedError) {
			console.log("game updated error", gameUpdatedError.message)
		}
	}, [gameUpdatedLoading, gameUpdatedError])

	useEffect(() => {
		if (gameUpdatedData && onGameUpdatedData) {
			onGameUpdatedData(gameUpdatedData)
		}
	}, [gameUpdatedData, onGameUpdatedData])

	/**
	 * Sends a message to the server based on the event and move(optional) properties
	 * @param event the event to send
	 * @param move the move to send for the respective event
	 * @returns a fetch result for the corresponding event
	 */
	const sendMessage = useCallback(
		async ({ event, move }: { event: ChessServerEvent; move?: Move }) => {
			switch (event) {
				case ChessServerEvent.START_GAME: {
					return await startGame()
				}
				case ChessServerEvent.MAKE_MOVE: {
					const response = move ? await makeMove({ variables: makeMoveInput({ move }) }) : undefined
					if (response) {
						if (response.data?.makeMove) {
							setToken(response.data.makeMove)
							response.data.makeMove = undefined

							console.log("token reset")
						}
					}
					return
				}
				case ChessServerEvent.RESIGN: {
					const response = await resign()
					if (response) {
						if (response.data?.resign) {
							setToken(response.data.resign)
							response.data.resign = undefined

							console.log("token reset")
						}
					}
					return
				}
				case ChessServerEvent.OFFER_DRAW: {
					const response = await offerDraw()
					if (response) {
						if (response.data?.offerDraw) {
							setToken(response.data.offerDraw)
							response.data.offerDraw = undefined

							console.log("token reset")
						}
					}
					return
				}
				case ChessServerEvent.ACCEPT_DRAW: {
					const response = await acceptDraw()
					if (response) {
						if (response.data?.acceptDraw) {
							setToken(response.data.acceptDraw)
							response.data.acceptDraw = undefined

							console.log("token reset")
						}
					}
					return
				}
				case ChessServerEvent.DENY_DRAW: {
					const response = await denyDraw()
					if (response) {
						if (response.data?.denyDraw) {
							setToken(response.data.denyDraw)
							response.data.denyDraw = undefined

							console.log("token reset")
						}
					}
					return
				}
			}
		},
		[makeMoveInput, startGame, makeMove, resign, offerDraw, acceptDraw, denyDraw, setToken]
	)

	return { sendMessage }
}

export default useChessApollo
