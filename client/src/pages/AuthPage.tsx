import LoginForm from "../auth/components/LoginForm"
import SignupForm from "../auth/components/SignupForm"
import Header from "../shared/components/Header"
import NavBar from "../shared/components/NavBar"

const AuthPage = () => {
	return (
		<div className="auth-page-container">
			<NavBar />
			<div className="content">
				<Header name="Authenticate" />
				<div
					className="auth-components"
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-evenly",
						height: "90%",
						width: "100%",
					}}
				>
					<LoginForm />
					<SignupForm />
				</div>
			</div>
		</div>
	)
}

export default AuthPage
