import WebSocket, { WebSocketServer, WebSocket as WS } from "ws"
import http from "http"
import { Move, GameState, Game } from "../types/types"
import { ChessServerEvent, ChessClientEvent } from "./types"
import GameModel from "../models/GameModel"

interface ChessGameSession {
	username1: string | null
	username2: string | null
	drawOffer?: boolean
}

type UserInitData = {
	username: string
}

export default class ChessWebSocketServer {
	private wss: WebSocketServer | undefined
	private gameModel: GameModel
	private sessions: Map<string, ChessGameSession> = new Map()
	private disconnectedPlayers: Map<string, string> = new Map()
	private connections: Map<string, WS> = new Map()

	constructor() {
		this.gameModel = new GameModel()
	}

	///////////////////////////////////////////
	//            message handlers           //
	///////////////////////////////////////////
	private handleMessage(ws: WS, message: WebSocket.RawData): void {
		try {
			const messageObject = JSON.parse(message.toString())
			const event: ChessServerEvent = messageObject.event
			const data = messageObject.data

			console.log("received event:", event, "data:", data)
			switch (event) {
				case ChessServerEvent.INIT_CONNECTION:
					this.handleInitConnection(ws, data)
					break
				case ChessServerEvent.START_GAME:
					this.handleStartGame(ws, data)
					break
				case ChessServerEvent.MAKE_MOVE:
					this.handleMakeMove(ws, data)
					break
				case ChessServerEvent.RESIGN:
					this.handleResign(ws, data)
					break
				case ChessServerEvent.OFFER_DRAW:
					this.handleOfferDraw(ws, data)
					break
				case ChessServerEvent.ACCEPT_DRAW:
					this.handleAcceptDraw(ws, data)
					break
				case ChessServerEvent.DENY_DRAW:
					this.handleDenyDraw(ws, data)
					break
				default:
					console.log("default logic")
			}
		} catch (error) {
			console.error("Error parsing message:", error)
		}
	}
	private handleInitConnection(ws: WS, data: UserInitData): void {
		const username: string = data.username
		if (!username) {
			console.log(`user ${username} not initialized. data.username not provided`)
			return
		}
		this.connections.set(username, ws)
		console.log(`connection with user ${username} initialized`)
		const sessionId = this.findSessionIdByUsername(username)
		if (!sessionId) {
			console.log(`user ${username} not found in active sessions`)
			this.handleStartGame(ws, { username })
			return
		}
		console.log("user", username, "connected to session by id:", sessionId)
		this.disconnectedPlayers.delete(username)
		this.reconnectToSession(sessionId, username)
	}
	private handleStartGame(ws: WS, data: { username: string }): void {
		const username = this.findUsernameByConnection(ws)

		if (!username) {
			console.log(`user ${username} not found in connections`)
			return
		} else if (username !== data.username) {
			console.log(`user ${username} trying to start game as ${data.username}`)
			return
		}
		if (this.gameModel.isPlayerWaiting(username)) {
			console.log(`${username} is already waiting`)
			return
		}
		console.log(`${username} starting a game`)
		const { id, game } = this.gameModel.handleStartGame(username)

		if (!game) {
			this.sendWaiting(ws, username)
			console.log(`user ${username} is waiting for an opponent`)
		} else {
			const sessionId = game.id
			const opponentUsername = game.white === username ? game.black : game.white
			this.createSession(sessionId, username, opponentUsername)
			this.sendToSession(sessionId, ChessClientEvent.GAME_START, game)
		}
	}
	private handleMakeMove(ws: WS, data: Move): void {
		const username = this.findUsernameByConnection(ws)
		if (!username) return
		const sessionId = this.findSessionIdByUsername(username)
		if (!sessionId) return
		const move: Move = data
		if (!move) return
		this.gameModel.makeMove(sessionId, username, move)
		const activeGame = this.gameModel.findActiveGameById(sessionId)
		if (activeGame) {
			this.sendToSession(sessionId, ChessClientEvent.MOVE_MADE, move)
		} else {
			const endedGame = this.gameModel.findEndedGameById(sessionId)
			if (endedGame) {
				this.sendToSession(sessionId, ChessClientEvent.GAME_OVER, { state: endedGame.state, move })
			}
		}
	}
	private handleResign(ws: WS, data: { username: string }) {
		const username = this.findUsernameByConnection(ws)
		if (!username) return
		if (username !== data.username) {
			console.log(`user ${username} trying to resign as ${data.username}`)
			return
		}
		const sessionId = this.findSessionIdByUsername(username)
		if (!sessionId) return
		this.gameModel.resign(sessionId, username)
		const game = this.gameModel.findEndedGameById(sessionId)
		if (!game) return
		const responseData = {
			state: game.state,
			moves: game.moves,
			white: game.white,
			black: game.black,
		}
		const event: ChessClientEvent = ChessClientEvent.OPPONENT_RESIGNED
		this.sendToSession(sessionId, event, responseData)
		this.sessions.delete(sessionId)
	}
	private handleOfferDraw(ws: WS, data: { username: string }) {
		const username = this.findUsernameByConnection(ws)
		if (!username) return
		if (username !== data.username) {
			console.log(`user ${username} trying to offer draw as ${data.username}`)
			return
		}
		const sessionId = this.findSessionIdByUsername(username)
		if (!sessionId) return
		const session = this.sessions.get(sessionId)
		if (!session) return
		session.drawOffer = true
		const opponent = this.getOpponent(username, session)
		if (!opponent) return
		const opponentWs = this.connections.get(opponent)
		if (!opponentWs) return
		const event = ChessClientEvent.DRAW_OFFERED
		opponentWs.send(JSON.stringify({ event }))
	}
	private handleAcceptDraw(ws: WS, data: { username: string }) {
		const username = this.findUsernameByConnection(ws)
		if (!username) return
		if (username !== data.username) {
			console.log(`${username} tried to accept draw as ${data.username}`)
		}
		const sessionId = this.findSessionIdByUsername(username)
		if (!sessionId) return
		const session = this.sessions.get(sessionId)
		if (!session) return
		if (session.drawOffer) {
			this.gameModel.endGame(sessionId, GameState.DRAW)
			const game = this.gameModel.findEndedGameById(sessionId)
			if (!game) return
			const data = {
				state: game.state,
				moves: game.moves,
				white: game.white,
				black: game.black,
			}
			const event = ChessClientEvent.DRAW_ACCEPTED
			this.sendToSession(sessionId, event, data)
			this.sessions.delete(sessionId)
		} else {
			return
		}
	}
	private handleDenyDraw(ws: WS, data: { username: string }) {
		const username = this.findUsernameByConnection(ws)
		if (!username) return
		if (username !== data.username) {
			console.log(`${username} tried to deny draw as ${data.username}`)
		}
		const sessionId = this.findSessionIdByUsername(username)
		if (!sessionId) return
		const session = this.sessions.get(sessionId)
		if (!session) return
		session.drawOffer = false
		const opponent = this.getOpponent(username, session)
		if (!opponent) return
		const opponentWs = this.connections.get(opponent)
		if (!opponentWs) return
		const event = ChessClientEvent.DRAW_DENIED
		opponentWs.send(JSON.stringify({ event }))
	}

	///////////////////////////////////////////
	//           property accessors          //
	///////////////////////////////////////////
	private reconnectToSession(sessionId: string, username: string): void {
		const game = this.gameModel.findActiveGameById(sessionId)
		if (!game) {
			console.log(`game not found for user ${username}`)
			return
		}
		const event = ChessClientEvent.GAME_RECONNECT
		const data = {
			state: game.state,
			moves: game.moves,
			white: game.white,
			black: game.black,
		}
		this.sendToSession(sessionId, event, data)
	}
	private createSession(sessionId: string, username1: string, username2: string): string {
		this.sessions.set(sessionId, { username1, username2 })
		console.log("created session by id", sessionId, "username", username1, username2)
		return sessionId
	}
	private findUsernameByConnection(ws: WS): string | null {
		for (const [username, connection] of this.connections.entries()) {
			if (connection === ws) {
				return username
			}
		}
		return null
	}
	private findSessionIdByUsername(username: string): string | undefined {
		for (const [sessionId, game] of this.sessions.entries()) {
			if (game.username1 === username || game.username2 === username) {
				return sessionId
			}
		}
		return this.disconnectedPlayers.get(username)
	}
	private getOpponent(username: string, session: ChessGameSession): string | undefined {
		if (session.username1 === username && session.username2) {
			return session.username2
		} else if (session.username2 === username && session.username1) {
			return session.username1
		}
	}
	private removeConnection(ws: WebSocket.WebSocket): void {
		const username = this.findUsernameByConnection(ws)

		if (username) {
			this.connections.delete(username)
		}
	}
	private removePlayerFromSession(ws: WS): void {
		const username = this.findUsernameByConnection(ws)
		if (!username) return

		if (this.gameModel.isPlayerWaiting(username)) {
			console.log(`${username} disconnected was waiting`)
			this.gameModel.removeWaitingPlayerByUsername(username)
			return
		}

		for (const [sessionId, session] of this.sessions.entries()) {
			if (session.username1 === username || session.username2 === username) {
				console.log(`Player ${username} disconnected. Waiting for reconnection...`)

				this.disconnectedPlayers.set(username, sessionId)

				const isPlayer1 = session.username1 === username

				if (isPlayer1) {
					session.username1 = null
				} else {
					session.username2 = null
				}

				setTimeout(() => {
					const stillDisconnected = this.disconnectedPlayers.get(username) === sessionId
					if (stillDisconnected) {
						console.log(`Player ${username} did not reconnect. Forfeiting game.`)
						this.gameModel.resign(sessionId, username)
						this.disconnectedPlayers.delete(username)
						this.sessions.delete(sessionId)
					} else {
						console.log(`Player ${username} reconnected in time.`)
					}
				}, 60 * 1000) // 1-minute timeout
			}
		}
	}

	//////////////////////////////////////////////
	//          casting functionality           //
	//////////////////////////////////////////////
	private sendWaiting(ws: WS, username: string): void {
		ws.send(
			JSON.stringify({
				event: ChessClientEvent.WAITING,
				data: {
					state: GameState.WAITING,
					board: GameModel.initialBoardSetup(),
					moves: [],
					white: username,
					black: null,
				},
			})
		)
	}
	private sendToSession(sessionId: string, event: ChessClientEvent, data: any): void {
		//get the game by session id
		const chessGame = this.sessions.get(sessionId) as ChessGameSession
		if (!chessGame) {
			console.warn(`Session ${sessionId} not found`)
			return
		}

		//prepare sockets and message to send
		const message = JSON.stringify({ event, data })
		const { username1, username2 } = chessGame as { username1: string; username2: string }

		const ws1 = this.connections.get(username1) as WS
		const ws2 = this.connections.get(username2) as WS

		if (ws1 && ws2) {
			ws1.send(message)
			ws2.send(message)
		}

		console.log("message", message, "sent to session by id:", sessionId)
	}

	//////////////////////////////////////////////
	//             close connection             //
	//////////////////////////////////////////////

	connect(server: http.Server) {
		this.wss = new WebSocketServer({ server })
		const address = server.address()
		if (typeof address === "object" && address !== null) {
			console.log(`Web Socket Server is running on ws://localhost:${address.port}`)
		} else {
			console.error("Server is not running")
		}
		this.wss.on("connection", (ws: WS) => {
			console.log("new client connected")

			ws.on("message", (message: WebSocket.RawData) => this.handleMessage(ws, message))
			ws.on("close", () => {
				console.log("client disconnected")
				this.removePlayerFromSession(ws)
				this.removeConnection(ws)
			})
		})
	}
	disconnect() {
		if (this.wss) {
			this.wss.close(() => console.log("WebSocket server closed"))
			this.wss = undefined
		}
	}
}
