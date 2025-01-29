import LoginForm from "../auth/components/LoginForm"
import SignupForm from "../auth/components/SignupForm"
import Header from "../shared/components/Header"
import NavBar from "../shared/components/NavBar"
import "./AuthPage.css"

const AuthPage = () => {
	return (
		<div className="auth-page-container">
			<NavBar />
			<div className="content">
				<Header name="Authenticate" />
				<div className="auth-components">
					<LoginForm />
					<SignupForm />
				</div>
			</div>
		</div>
	)
}

export default AuthPage
