import { useCallback, useEffect, useState } from "react"

interface useWebsocketOptions<T> {
	url: string
	onOpen?: () => void
	onMessage?: (message: T) => void
	onError?: (error: Event) => void
	onClose?: () => void
	initialData?: T
}

export default function useWebsocket<T>({ url, onOpen, onMessage, onError, onClose, initialData }: useWebsocketOptions<T>) {
	const [ws, setWs] = useState<WebSocket | null>(null)
	const [isConnected, setIsConnected] = useState<boolean>(false)

	useEffect(() => {
		const socket = new WebSocket(url)
		setWs(socket)

		socket.onopen = () => {
			setIsConnected(true)

			if (initialData && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify(initialData))
				console.log("initial data:")
				console.log(initialData)
				console.log("sent")
			}

			if (onOpen) {
				onOpen()
			}
		}

		socket.onmessage = (ev: MessageEvent) => {
			try {
				const message: T = JSON.parse(ev.data)
				if (onMessage) {
					onMessage(message)
				}
			} catch (e) {
				console.log("error parsing ev.data in onmessage")
			}
		}

		socket.onerror = (error: Event) => {
			if (onError) {
				onError(error)
			}
		}

		socket.onclose = () => {
			setIsConnected(false)
			if (onClose) {
				onClose()
			}
		}

		return () => {
			if (ws) {
				ws.close()
			}
		}
	}, [url, initialData, onClose, onError, onOpen, onMessage, ws])

	const sendMessage = useCallback(
		(message: T) => {
			if (ws && isConnected) {
				ws.send(JSON.stringify(message))
			} else {
				console.error("Websocket not connected")
			}
		},
		[ws, isConnected]
	)

	const close = useCallback(() => {
		if (ws) {
			ws.close()
			console.log("WebSocket connection closed")
		} else {
			console.log("WebSocket connection closed")
		}
	}, [ws])

	return { sendMessage, isConnected, close }
}
