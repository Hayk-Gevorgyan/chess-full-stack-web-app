import React, { useState } from "react"
import { useAuthContext } from "../../shared/hooks/useAuthContext"
import ToggleLoginSignup from "./ToggleLoginSignup"

const LoginForm = ({ toggleAuthMode }: { toggleAuthMode: () => void }) => {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const { loginError, success, logIn } = useAuthContext()

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			await logIn(username, password)
		} catch (err) {
			console.error("Login failed:", err)
		}
	}

	return (
		<div className="auth-form">
			<h1 className="title">Login</h1>
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
				<button type="submit" className="submit-btn">
					Login
				</button>
			</form>

			{loginError && <p style={{ color: "red" }}>{loginError}</p>}
			{success && <p style={{ color: "green" }}>{success}</p>}

			<ToggleLoginSignup toggleAuthMode={toggleAuthMode} />
		</div>
	)
}

export default LoginForm
