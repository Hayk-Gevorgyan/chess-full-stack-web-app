import { useState } from "react"
import { GameState } from "../types/types"
import "../styles/Controls.css"
import { useGameContext } from "../../shared/hooks/useGameContext"

const Controls = () => {
	const { resign, offerDraw, gameState, startGame, opponentOfferedDraw, acceptDraw, denyDraw } = useGameContext()
	const [showConfirmation, setShowConfirmation] = useState<"resign" | "draw" | null>(null)

	const handleYesClick = () => {
		if (showConfirmation === "resign") {
			resign()
		} else if (showConfirmation === "draw") {
			offerDraw()
		}
		setShowConfirmation(null)
	}

	const handleNoClick = () => {
		setShowConfirmation(null)
	}

	return (
		<div className="controls-container">
			{gameState === GameState.STARTED ? (
				<>
					<button onClick={() => setShowConfirmation("resign")}>Resign</button>

					<button onClick={() => setShowConfirmation("draw")}>Offer Draw</button>
				</>
			) : null}
			{gameState === GameState.WHITE_WIN || gameState === GameState.BLACK_WIN || gameState === GameState.DRAW ? (
				<button onClick={() => startGame()}>Start Game</button>
			) : null}

			{showConfirmation && (
				<div className="confirmation-dialog">
					<p>Are you sure you want to {showConfirmation === "resign" ? "resign" : "offer a draw"}?</p>
					<button onClick={handleYesClick}>Yes</button>
					<button onClick={handleNoClick}>No</button>
				</div>
			)}

			{opponentOfferedDraw && (
				<div className="opponent-draw-offer">
					<p>Your opponent has offered a draw. What do you want to do?</p>
					<button onClick={() => acceptDraw()}>Accept</button>
					<button onClick={() => denyDraw()}>Deny</button>
				</div>
			)}
		</div>
	)
}

export default Controls
