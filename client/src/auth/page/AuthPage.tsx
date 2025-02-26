import { useState } from "react"
import LoginForm from "../components/LoginForm"
import SignupForm from "../components/SignupForm"
import Header from "../../shared/components/Header"
import NavBar from "../../shared/components/NavBar"
import "../styles/AuthPage.css"

const AuthPage = () => {
	// State to toggle between login and signup views.
	const [showLogin, setShowLogin] = useState(true)

	/**
	 * Toggle function to switch views.
	 */
	const toggleAuthMode = () => {
		setShowLogin((prevMode) => !prevMode)
	}

	return (
		<div className="auth-page-container">
			<NavBar />
			<div className="content">
				<Header name="Authenticate" />
				<div className="auth-components">
					{showLogin ? <LoginForm toggleAuthMode={toggleAuthMode} /> : <SignupForm toggleAuthMode={toggleAuthMode} />}
				</div>
			</div>
		</div>
	)
}

export default AuthPage
