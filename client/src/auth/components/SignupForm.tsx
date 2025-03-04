import React, { useState } from "react"
import { useAuthContext } from "../../shared/hooks/useAuthContext"

const SignupForm = ({ toggleAuthMode }: { toggleAuthMode: () => void }) => {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [passwordRepeat, setPasswordRepeat] = useState("")
	const { signupError, success, signUp } = useAuthContext()

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			await signUp(username, password, passwordRepeat)
		} catch (err) {
			console.error("Login failed:", err)
		}
	}

	return (
		<div className="auth-form">
			<h1 className="title">SignUp</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label>
						Username:
						<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
					</label>
				</div>
				<div>
					<label>
						Password:
						<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
					</label>
				</div>
				<div>
					<label>
						Repeat Password:
						<input type="password" value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)} required />
					</label>
				</div>
				<button type="submit" className="submit-btn">
					Sign Up
				</button>
			</form>

			{signupError && <p style={{ color: "red" }}>{signupError}</p>}
			{success && <p style={{ color: "green" }}>{success}</p>}

			<p className="toggle-text">
				Already have an account?{" "}
				<button className="toggle-btn" onClick={toggleAuthMode}>
					Log in here
				</button>
			</p>
		</div>
	)
}

export default SignupForm
