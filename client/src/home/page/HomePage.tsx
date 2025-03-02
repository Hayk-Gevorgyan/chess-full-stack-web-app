import NavBar from "../../shared/components/NavBar"
import Header from "../../shared/components/Header"
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
						<div className="home-btns-container">
							<StartGameButton />
						</div>
						<img className="chessboard-img" src="./chessboard-img.png" alt="chessboard" />
					</div>
				</div>
			</div>
		</>
	)
}

export default HomePage
