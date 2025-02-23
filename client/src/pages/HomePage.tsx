import NavBar from "../shared/components/NavBar"
import Header from "../shared/components/Header"
import ChessBoard from "../chessGame/components/ChessBoard"
import { initialBoardSetup } from "../chessGame/chessValidation/helperFunctions"
import StartGameButton from "../shared/components/StartGameButton"
import { useAuthContext } from "../shared/hooks/useAuthContext"
import "./HomePage.css"

const HomePage = () => {
	const { username } = useAuthContext()

	return (
		<>
			<div className="home-page-container">
				<NavBar />
				<div className="content">
					<Header name={username ? username : "no username"} showLogoutButton={true} />
					<div
						className="home-content"
						// style={{ display: "flex", alignItems: "start", justifyContent: "space-evenly", flexDirection: "row" }}
					>
						<div className="home-btns">
							<StartGameButton />
						</div>
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
