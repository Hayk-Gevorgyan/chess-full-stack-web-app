import React, { useCallback, useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import useAuthMutations from "../../apollo/user/hooks/useAuthMutations"
import { useLocalStorage } from "../hooks/useLocalStorage"

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [username, setUsername] = useState<string | null>(null)
	const [loginError, setLoginError] = useState<string | null>(null)
	const [signupError, setSignupError] = useState<string | null>(null)
	const [logoutError, setLogoutError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const { setItem: setToken, removeItem: removeToken } = useLocalStorage("token")
	const serverUrl = "http://localhost:56789"
	const navigate = useNavigate()
	const location = useLocation()

	const { loginCallback, signupCallback, logoutCallback, reconnectCallback } = useAuthMutations()

	const reconnect = useCallback(async () => {
		setUsername(null)
		setSuccess(null)

		const response = await reconnectCallback()

		const data = response.data

		if (data) {
			const { error, message, username } = data.reconnect

			if (error) {
				console.log(error)
				removeToken()
				return
			}
			if (message) {
				console.log({ message })
			}
			if (username) {
				setUsername(username)
				setSuccess(message ? message : "Reconnected Successfully")
			}
		}
	}, [reconnectCallback, removeToken])

	useEffect(() => {
		reconnect()
	}, [reconnect])

	useEffect(() => {
		if (username) {
			if (location.pathname === "/auth") {
				navigate("/")
			}
		} else {
			navigate("/auth")
		}
	}, [username, navigate, location.pathname])

	const logIn = async (username: string, password: string) => {
		setUsername(null)
		setSuccess(null)
		removeToken()

		const response = await loginCallback({ variables: { username, password } })

		const data = response.data

		if (data) {
			const { error, message, username, token } = data.login
			if (error) {
				setLoginError(error)
				return
			}
			if (username && token) {
				setUsername(username)
				setSuccess(message ? message : "Login Successful")
				setToken(token)
			}
		}
	}

	const signUp = async (username: string, password: string) => {
		setUsername(null)
		setSuccess(null)
		removeToken()

		const response = await signupCallback({ variables: { username, password } })

		const data = response.data

		if (data) {
			const { error, message, username, token } = data.signup
			if (error) {
				console.log(error)
				setSignupError(error)
				return
			}
			if (username && token) {
				setUsername(username)
				setSuccess(message ? message : "Signup Successful")
				setToken(token)
			}
		}
	}

	const logOut = async (): Promise<void> => {
		console.log("logout called")
		setLoginError(null)
		setSignupError(null)
		setSuccess(null)
		removeToken()

		const response = await logoutCallback()

		const data = response.data

		if (data) {
			console.log(data)
			const { error, message } = data.logout
			if (error) {
				setLogoutError(error)
			}
			if (message) {
				setSuccess(message)
			}
		}
		console.log("logged out")
		navigate("/auth")
		setUsername(null)
		removeToken()
		console.log("Logged out successfully")
	}

	return (
		<AuthContext.Provider value={{ username, logIn, signUp, logOut, loginError, signupError, logoutError, success, serverUrl }}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthProvider
