import { useContext } from "react"
import { GameContext } from "../contexts/GameContext"

export const useGameContext = () => {
	const context = useContext(GameContext)
	if (!context) {
		throw new Error("useGameContext must be used within an AuthProvider")
	}
	return context
}
