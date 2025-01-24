import NavBar from "../shared/components/NavBar"
import ChessGame from "../game/components/ChessGame"
import Header from "../shared/components/Header"
import { useAuthContext } from "../shared/hooks/useAuthContext"
import { useEffect } from "react"
import { useGameContext } from "../shared/hooks/useGameContext"

const GamePage = () => {
	const { username } = useAuthContext()
	const { startGame } = useGameContext()
	useEffect(() => {
		console.log("Game started")
		startGame()
	}, [])

	return (
		<div className="game-page-container">
			<NavBar />
			<div className="content">
				<Header name="Game" />
				{username ? <ChessGame /> : null}
			</div>
		</div>
	)
}

export default GamePage
