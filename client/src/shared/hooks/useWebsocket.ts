import { useCallback, useEffect, useState, useRef } from "react"

interface UseWebsocketOptions<T> {
	url: string
	onMessage: (message: T) => void
	initialData?: T
}

export default function useWebsocket<T>({ url, onMessage, initialData }: UseWebsocketOptions<T>) {
	const [isConnected, setIsConnected] = useState(false)
	const socketRef = useRef<WebSocket | null>(null)

	const connect = useCallback(() => {
		if (socketRef.current) {
			console.warn("WebSocket already exists, skipping connection.")
			return
		}

		const ws = new WebSocket(url)
		socketRef.current = ws

		ws.onopen = () => {
			setIsConnected(true)
			console.log("WebSocket connected")

			if (initialData) {
				ws.send(JSON.stringify(initialData))
				console.log("Initial data sent:", initialData)
			}
		}

		ws.onmessage = (event: MessageEvent) => {
			try {
				const message: T = JSON.parse(event.data)
				if (onMessage) onMessage(message)
			} catch (error) {
				console.error("Failed to parse WebSocket message:", error)
			}
		}

		ws.onerror = (event: Event) => {
			console.error("WebSocket error:", event)
		}

		ws.onclose = () => {
			setIsConnected(false)
			console.log("WebSocket disconnected")
			socketRef.current = null
		}
	}, [url, onMessage, initialData])

	const disconnect = useCallback(() => {
		if (socketRef.current) {
			socketRef.current.close()
			socketRef.current = null
			console.log("WebSocket connection closed manually")
		}
	}, [])

	const sendMessage = useCallback((message: T) => {
		if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
			socketRef.current.send(JSON.stringify(message))
		} else {
			console.error("WebSocket is not connected.")
		}
	}, [])

	useEffect(() => {
		connect()

		return () => {
			disconnect()
		}
	}, [connect, disconnect])

	return { sendMessage, isConnected }
}
