import { Link } from "react-router-dom"
import { useAuthContext } from "../hooks/useAuthContext"
import { authPath, homePath } from "../../App"

const NavBar = () => {
	const { username } = useAuthContext()

	return (
		<div className="navbar">
			<nav>
				<Link to={homePath}>Home</Link>
				{username ? <Link to={`/profile/${username}`}>Profile</Link> : <Link to={authPath}>Auth</Link>}
			</nav>
		</div>
	)
}

export default NavBar
