import { useNavigate, useParams } from "react-router-dom"
import Header from "../../shared/components/Header"
import NavBar from "../../shared/components/NavBar"
import { useAuthContext } from "../../shared/hooks/useAuthContext"
import { useEffect } from "react"
import { authPath } from "../../App"
import EndedChessGame from "../components/EndedChessGame"

const EndedChessGamePage = () => {
	const { username } = useAuthContext()
	const { id } = useParams<{ id: string | undefined }>()
	const navigate = useNavigate()

	useEffect(() => {
		if (!id) {
			navigate(authPath)
		}
	}, [id, navigate])

	return (
		<div className="page-container">
			<NavBar />
			<div className="content">
				<Header name={username ? username : "no username"} showLogoutButton={true} />
				{id && <EndedChessGame id={id} />}
			</div>
		</div>
	)
}

export default EndedChessGamePage
