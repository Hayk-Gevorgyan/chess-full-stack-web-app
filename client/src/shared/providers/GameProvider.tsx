import React, { useCallback, useEffect, useState } from "react"
import { GameContext } from "../contexts/GameContext"
import { ChessServerEvent, PlayerColor, GameState, Move } from "../../chessGame/types/types"
import { useAuthContext } from "../hooks/useAuthContext"
import useChessApollo from "../../apollo/chessGame/hooks/useChessApollo"
import { useLocation } from "react-router-dom"
import { chessGamePath } from "../../App"

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

const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const { username } = useAuthContext()
	const [id, setId] = useState<string | undefined>()
	const [moves, setMoves] = useState<Move[]>([])
	const [opponentOfferedDraw, setOpponentOfferedDraw] = useState<boolean>(false)
	const [gameState, setGameState] = useState<GameState>(GameState.WAITING)
	const [me, setMe] = useState<string>(username ? username : "username")
	const [myColor, setMyColor] = useState<PlayerColor>(PlayerColor.WHITE)
	const [opponent, setOpponent] = useState<string>("opponent")
	const [opponentColor, setOpponentColor] = useState<PlayerColor>(PlayerColor.BLACK)
	const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
	const location = useLocation()

	const updatePlayers = useCallback(
		(white: string, black: string) => {
			if (username === white) {
				setMe(white)
				setMyColor(PlayerColor.WHITE)
				setOpponent(black)
				setOpponentColor(PlayerColor.BLACK)
			}
			if (username === black) {
				setMe(black)
				setMyColor(PlayerColor.BLACK)
				setOpponent(white)
				setOpponentColor(PlayerColor.WHITE)
			}
		},
		[username]
	)

	useEffect(() => {
		if (location.pathname !== chessGamePath) {
			setIsSubscribed(false)
		}
	}, [location.pathname])

	const handleGraphQLClientEvent = useCallback(
		(data: GameUpdatedData) => {
			const { gameUpdated } = data
			if (gameUpdated) {
				const { white, black, state, moves, drawOffer } = gameUpdated

				setGameState(state)
				setMoves(moves)
				updatePlayers(white, black)
				if (drawOffer && drawOffer === opponent) {
					setOpponentOfferedDraw(true)
				} else {
					setOpponentOfferedDraw(false)
				}
				if (state === GameState.BLACK_WIN || state === GameState.DRAW || state === GameState.WHITE_WIN) {
					setIsSubscribed(false)
				}
			}
		},
		[updatePlayers, opponent]
	)

	const { sendMessage } = useChessApollo<GameUpdatedData>({
		onGameUpdatedData: handleGraphQLClientEvent,
		isSubscribed,
	})

	const startGame = useCallback(async () => {
		const response = await sendMessage({ event: ChessServerEvent.START_GAME })
		const data = response?.data
		if (data) {
			if (data.startGame) {
				setId(data.startGame?.id)
				const game = data.startGame?.game
				if (game) {
					if (game.state) {
						setGameState(game.state)
					}
					if (game?.white && game?.black) {
						updatePlayers(game.white, game.black)
					}
					if (game.moves) {
						setMoves(game.moves)
					}
				} else {
					setGameState(GameState.WAITING)
					updatePlayers(me, "opponent")
					setMoves([])
				}
				setIsSubscribed(true)
			}
		}
	}, [me, sendMessage, updatePlayers])
	const offerDraw = useCallback(() => {
		sendMessage({ event: ChessServerEvent.OFFER_DRAW })
	}, [sendMessage])
	const acceptDraw = useCallback(() => {
		sendMessage({ event: ChessServerEvent.ACCEPT_DRAW })
	}, [sendMessage])
	const denyDraw = useCallback(() => {
		sendMessage({ event: ChessServerEvent.DENY_DRAW })
	}, [sendMessage])
	const resign = useCallback(() => {
		sendMessage({ event: ChessServerEvent.RESIGN })
	}, [sendMessage])
	const makeMove = useCallback(
		(move: Move) => {
			sendMessage({ event: ChessServerEvent.MAKE_MOVE, move })
		},
		[sendMessage]
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
