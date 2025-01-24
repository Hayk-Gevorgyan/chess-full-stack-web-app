import React, { useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [username, setUsername] = useState<string | null>(null)
	const [loginError, setLoginError] = useState<string | null>(null)
	const [signupError, setSignupError] = useState<string | null>(null)
	const [logoutError, setLogoutError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const serverUrl = "http://localhost:56789"
	const navigate = useNavigate()

	useEffect(() => {
		if (!username) {
			navigate("/auth")
		}
	}, [username, navigate])

	const logIn = async (username: string, password: string): Promise<void> => {
		setLoginError(null)
		setSuccess(null)

		try {
			const response = await fetch(`${serverUrl}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			})

			if (!response.ok) {
				const errorMessage = await response.text()
				throw new Error(errorMessage || "Login failed.")
			}

			const res = await response.json()
			if (res.user && res.user.username) {
				setUsername(res.user.username)
				setSuccess("Login successful!")
				navigate("/")
			} else {
				throw new Error(res.message || "Unexpected server response.")
			}
		} catch (err) {
			setLoginError(err instanceof Error ? err.message : "A network error occurred. Please try again.")
		}
	}

	const signUp = async (username: string, password: string, passwordRepeat: string): Promise<void> => {
		setSignupError(null)
		setSuccess(null)

		if (password !== passwordRepeat) {
			setSignupError("Passwords do not match.")
			return
		}

		try {
			const response = await fetch(`${serverUrl}/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			})

			if (!response.ok) {
				const errorMessage = await response.text()
				throw new Error(errorMessage || "Signup failed.")
			}

			const res = await response.json()
			if (res.user && res.user.username) {
				setUsername(res.user.username)
				setSuccess("Signup successful! You are now logged in.")
				navigate("/")
			} else {
				throw new Error(res.message || "Unexpected server response.")
			}
		} catch (err) {
			setSignupError(err instanceof Error ? err.message : "A network error occurred. Please try again.")
		}
	}

	const logOut = async (): Promise<void> => {
		setLoginError(null)
		setSignupError(null)
		setSuccess(null)

		try {
			const response = await fetch(`${serverUrl}/logout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username }),
			})

			if (!response.ok) {
				const errorMessage = await response.text()
				throw new Error(errorMessage || "Logout failed.")
			}

			setUsername(null)
			setSuccess("Logout successful!")
		} catch (err) {
			setLogoutError(err instanceof Error ? err.message : "A network error occurred. Please try again.")
		}
	}

	return (
		<AuthContext.Provider value={{ username, logIn, signUp, logOut, loginError, signupError, logoutError, success, serverUrl }}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthProvider
