import { Link } from "react-router-dom"
import "../styles/NavBar.css"

const NavBar = () => {
	return (
		<div className="navbar">
			<nav>
				<Link to="/">Home</Link>
				<Link to="/auth">Auth</Link>
			</nav>
		</div>
	)
}

export default NavBar
