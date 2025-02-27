import NavBar from "../../shared/components/NavBar"
import Header from "../../shared/components/Header"
import ChessBoard from "../../chessGame/components/ChessBoard"
import { initialBoardSetup } from "../../chessGame/chessValidation/helperFunctions"
import StartGameButton from "../../shared/components/StartGameButton"
import { useAuthContext } from "../../shared/hooks/useAuthContext"
import "../styles/HomePage.css"

const HomePage = () => {
	const { username } = useAuthContext()

	return (
		<>
			<div className="page-container">
				<NavBar />
				<div className="content">
					<Header name={username ? username : "no username"} showLogoutButton={true} />
					<div className="home-content">
						<div className="home-btn">
							<StartGameButton />
						</div>
						<ChessBoard
							board={initialBoardSetup()}
							selectedSquare={undefined}
							checkedSquare={undefined}
							validMoves={[]}
							onClick={() => {}}
							onDragStart={() => {}}
							onDrop={() => {}}
						/>
					</div>
				</div>
			</div>
		</>
	)
}

export default HomePage
