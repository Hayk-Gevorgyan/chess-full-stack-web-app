import { Link } from "react-router-dom"
import { useAuthContext } from "../hooks/useAuthContext"

const NavBar = () => {
	const { username } = useAuthContext()

	return (
		<div className="navbar">
			<nav>
				<Link to="/">Home</Link>
				{username ? <Link to={`/profile/${username}`}>Profile</Link> : <Link to="/auth">Auth</Link>}
			</nav>
		</div>
	)
}

export default NavBar
