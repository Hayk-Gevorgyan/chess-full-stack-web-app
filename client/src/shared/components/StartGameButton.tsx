import { useEffect, useState } from "react"
import { useGameContext } from "../hooks/useGameContext"
import { useNavigate } from "react-router-dom"
import { chessGamePath } from "../../App"

const StartGameButton = () => {
	const { startGame } = useGameContext()

	const [startGameClicked, setStartGameClicked] = useState<boolean>(false)
	const navigate = useNavigate()

	useEffect(() => {
		if (startGameClicked) {
			navigate(chessGamePath)
			setStartGameClicked(false)
		}
	}, [startGameClicked, navigate, startGame])

	return (
		<button
			type="button"
			className="start-game-btn common-btn"
			onClick={() => {
				setStartGameClicked(true)
				startGame()
			}}
			disabled={startGameClicked}
		>
			Start Game
		</button>
	)
}

export default StartGameButton
