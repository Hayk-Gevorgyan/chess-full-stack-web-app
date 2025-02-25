import { useEffect, useState } from "react"
import { GameState } from "../types/types"
import "../styles/Controls.css"
import { useGameContext } from "../../shared/hooks/useGameContext"
import StartGameButton from "../../shared/components/StartGameButton"

const Controls = () => {
	const { resign, offerDraw, gameState, opponentOfferedDraw, acceptDraw, denyDraw } = useGameContext()
	const [showConfirmation, setShowConfirmation] = useState<"resign" | "draw" | null>(null)

	useEffect(() => {
		if (gameState !== GameState.STARTED) setShowConfirmation(null)
	}, [gameState])

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
					<button className="common-btn" onClick={() => setShowConfirmation("resign")}>
						Resign
					</button>

					<button className="common-btn" onClick={() => setShowConfirmation("draw")}>
						Offer Draw
					</button>
				</>
			) : null}
			{gameState === GameState.WHITE_WIN || gameState === GameState.BLACK_WIN || gameState === GameState.DRAW ? (
				<StartGameButton />
			) : null}

			{showConfirmation && (
				<div className="confirmation-dialog">
					<p>Are you sure you want to {showConfirmation === "resign" ? "resign" : "offer a draw"}?</p>
					<button className="common-btn" onClick={handleYesClick}>
						Yes
					</button>
					<button className="common-btn" onClick={handleNoClick}>
						No
					</button>
				</div>
			)}

			{opponentOfferedDraw && (
				<div className="opponent-draw-offer">
					<p>Your opponent has offered a draw. What do you want to do?</p>
					<button className="common-btn" onClick={() => acceptDraw()}>
						Accept
					</button>
					<button className="common-btn" onClick={() => denyDraw()}>
						Deny
					</button>
				</div>
			)}
		</div>
	)
}

export default Controls
