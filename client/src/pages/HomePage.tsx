import { useEffect, useState } from "react"
import NavBar from "../shared/components/NavBar"
import Header from "../shared/components/Header"
import { useNavigate } from "react-router-dom"
import ChessBoard from "../game/components/ChessBoard"
import { initialBoardSetup } from "../game/utils/helperFunctions"

const HomePage = () => {
	const [startGameClicked, setStartGameClicked] = useState<boolean>(false)
	const navigate = useNavigate()

	useEffect(() => {
		if (startGameClicked) {
			navigate("/game")
		}
	}, [startGameClicked, navigate])

	return (
		<>
			<div className="home-page-container">
				<NavBar />
				<div className="content">
					<Header name="Home" />
					<div
						className="home-content"
						style={{ display: "flex", alignItems: "start", justifyContent: "space-evenly", flexDirection: "row" }}
					>
						<button
							type="button"
							className="start-game-btn"
							onClick={() => setStartGameClicked(true)}
							disabled={startGameClicked}
						>
							Start Game
						</button>
						<ChessBoard
							board={initialBoardSetup()}
							selectedSquare={undefined}
							checkedSquare={undefined}
							validMoves={[]}
							onClick={() => {}}
						/>
					</div>
				</div>
			</div>
		</>
	)
}

export default HomePage
