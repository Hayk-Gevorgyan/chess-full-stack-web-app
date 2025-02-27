// ProfilePage.tsx
import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "../../shared/components/Header"
import GamesList from "../components/GamesList"
import NavBar from "../../shared/components/NavBar"
import "../styles/ProfilePage.css"

export default function ProfilePage() {
	const { username } = useParams<{ username: string | undefined }>()
	const navigate = useNavigate()

	useEffect(() => {
		if (!username) {
			navigate("/auth")
		}
	}, [username, navigate])

	return (
		<>
			<div className="page-container">
				<NavBar />
				<div className="content">
					<Header name={username ? username : "no username"} showLogoutButton={true} />

					<div className="profile-content">{username && <GamesList username={username} />}</div>
				</div>
			</div>
		</>
	)
}
