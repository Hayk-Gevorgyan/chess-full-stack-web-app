import NavBar from "../../shared/components/NavBar"
import ChessGame from "../components/ChessGame"
import Header from "../../shared/components/Header"
import { useAuthContext } from "../../shared/hooks/useAuthContext"
import "../styles/ChessGamePage.css"
const ChessGamePage = () => {
	const { username } = useAuthContext()

	return (
		<div className="page-container">
			<NavBar />
			<div className="content">
				<Header name={username ? username : "no username"} showLogoutButton={true} />

				{username ? <ChessGame /> : null}
			</div>
		</div>
	)
}

export default ChessGamePage
