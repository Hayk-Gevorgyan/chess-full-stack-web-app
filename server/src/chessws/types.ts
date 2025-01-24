export enum ChessServerEvent {
	INIT_CONNECTION = "init-connection",
	START_GAME = "start-game",
	MAKE_MOVE = "make-move",
	RESIGN = "resign",
	OFFER_DRAW = "offer-draw",
	ACCEPT_DRAW = "accept-draw",
	DENY_DRAW = "deny-draw",
}

export enum ChessClientEvent {
	GAME_RECONNECT = "game-reconnect",
	CONNECTED = "connected",
	WAITING = "waiting",
	GAME_START = "game-start",
	MOVE_MADE = "move-made",
	OPPONENT_RESIGNED = "opponent-resigned",
	DRAW_OFFERED = "draw-offered",
	DRAW_ACCEPTED = "draw-accepted",
	DRAW_DENIED = "draw-denied",
	GAME_OVER = "game-over",
}
