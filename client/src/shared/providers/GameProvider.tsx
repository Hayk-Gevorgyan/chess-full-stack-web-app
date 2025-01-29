import React, { useCallback, useEffect, useState } from "react"
import { GameContext, ChessWebSocketMessage } from "../contexts/GameContext"
import { ChessClientEvent, ChessServerEvent, Color, GameState, Move } from "../../game/types/types"
import { useAuthContext } from "../hooks/useAuthContext"
import { useChessGQL, GameUpdatedData } from "../../game/graphql/hooks"
import { GAME_UPDATED_SUBSCIPTION_QUERY } from "../../game/graphql/queries"

const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const { username } = useAuthContext()
	const [id, setId] = useState<string | undefined>()
	const [moves, setMoves] = useState<Move[]>([])
	const [opponentOfferedDraw, setOpponentOfferedDraw] = useState<boolean>(false)
	const [gameState, setGameState] = useState<GameState>(GameState.WAITING)
	const [me, setMe] = useState<string>(username ? username : "username")
	const [myColor, setMyColor] = useState<Color>(Color.WHITE)
	const [opponent, setOpponent] = useState<string>("opponent")
	const [opponentColor, setOpponentColor] = useState<Color>(Color.BLACK)
	const updatePlayers = useCallback(
		(white: string, black: string) => {
			if (username === white) {
				setMe(white)
				setMyColor(Color.WHITE)
				setOpponent(black)
				setOpponentColor(Color.BLACK)
			}
			if (username === black) {
				setMe(black)
				setMyColor(Color.BLACK)
				setOpponent(white)
				setOpponentColor(Color.WHITE)
			}
		},
		[username]
	)

	const moveMade = useCallback(
		(move: Move) => {
			setMoves((prevMoves) => [...prevMoves, move])
		},
		[setMoves]
	)

	const handleWSClientEvent = useCallback(
		(message: ChessWebSocketMessage) => {
			console.log("handling message", message)
			const { event, data } = message
			switch (event) {
				case ChessClientEvent.CONNECTED:
					console.log("Connected to server")
					break
				case ChessClientEvent.WAITING:
				case ChessClientEvent.OPPONENT_RESIGNED:
				case ChessClientEvent.DRAW_ACCEPTED: {
					const { state } = data
					setGameState(state)
					break
				}
				case ChessClientEvent.GAME_START: {
					const { id, state, white, black } = data
					setId(id)
					setGameState(state)
					setMoves([])
					updatePlayers(white, black)
					break
				}
				case ChessClientEvent.MOVE_MADE: {
					const { from, to, promotion } = data
					moveMade({ from, to, promotion })
					break
				}
				case ChessClientEvent.DRAW_OFFERED:
					setOpponentOfferedDraw(true)
					break

				case ChessClientEvent.DRAW_DENIED:
					alert("draw denied")
					break

				case ChessClientEvent.GAME_OVER: {
					const { state, move } = data
					const { from, to, promotion } = move
					setGameState(state)
					moveMade({ from, to, promotion })
					setId(undefined)
					break
				}
				default:
					console.error("unknown event")
			}
		},
		[setGameState, moveMade, setOpponentOfferedDraw, setId, updatePlayers]
	)

	const handleGraphQLClientEvent = useCallback(
		(data: GameUpdatedData) => {
			console.log("handling game updated data", data)
			const { gameUpdated } = data
			if (gameUpdated) {
				const { white, black, state, moves, drawOffer } = gameUpdated
				if (gameUpdated.id === id) {
					setGameState(state)
					setMoves(moves)
					updatePlayers(white, black)
					if (drawOffer && drawOffer === opponent) {
						console.log("opponent offered draw:", opponent)
						setOpponentOfferedDraw(true)
					} else setOpponentOfferedDraw(false)
				}
			}
		},
		[id, updatePlayers, opponent]
	)

	// const initialData = useMemo(
	// 	() => ({
	// 		event: ChessServerEvent.INIT_CONNECTION,
	// 		data: { username },
	// 	}),
	// 	[username]
	// )

	const { sendMessage, startGraphQLSubscription } = useChessGQL()

	useEffect(() => {
		const unsubscribe = startGraphQLSubscription<GameUpdatedData>(
			GAME_UPDATED_SUBSCIPTION_QUERY,
			{ id, username },
			handleGraphQLClientEvent
		)

		return () => {
			console.log("unsubscribing")
			unsubscribe?.()
		}
	}, [startGraphQLSubscription, handleGraphQLClientEvent, id, username])

	const startGame = useCallback(async () => {
		const response = await sendMessage({ event: ChessServerEvent.START_GAME, data: { username } })
		const data = response?.data
		console.log("data received", response)
		if (data) {
			if (data.startGame) {
				setId(data.startGame?.id)
				const game = data.startGame?.game
				if (game?.state && game?.white && game?.black) {
					setGameState(game.state)
					updatePlayers(game.white, game.black)
				}
			}
		}
	}, [username, sendMessage, updatePlayers])
	const offerDraw = useCallback(() => {
		sendMessage({ event: ChessServerEvent.OFFER_DRAW, data: { id, username } })
	}, [id, username, sendMessage])
	const acceptDraw = useCallback(() => {
		sendMessage({ event: ChessServerEvent.ACCEPT_DRAW, data: { id, username } })
	}, [id, username, sendMessage])
	const denyDraw = useCallback(() => {
		sendMessage({ event: ChessServerEvent.DENY_DRAW, data: { id, username } })
	}, [id, username, sendMessage])
	const resign = useCallback(() => {
		sendMessage({ event: ChessServerEvent.RESIGN, data: { id, username } })
	}, [id, username, sendMessage])
	const makeMove = useCallback(
		(move: Move) => {
			sendMessage({ event: ChessServerEvent.MAKE_MOVE, data: { id, username, move } })
		},
		[id, username, sendMessage]
	)
	return (
		<GameContext.Provider
			value={{
				id,
				gameState,
				moves,
				me,
				myColor,
				opponent,
				opponentColor,
				opponentOfferedDraw,
				startGame,
				offerDraw,
				acceptDraw,
				denyDraw,
				resign,
				makeMove,
			}}
		>
			{children}
		</GameContext.Provider>
	)
}

export default GameProvider
