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

	const { loginCallback, signupCallback, logoutCallback, authenticateCallback } = useAuthMutations()

	const authenticate = useCallback(async () => {
		setUsername(null)
		setSuccess(null)

		const response = await authenticateCallback()

		const data = response.data

		if (data && data.authenticate) {
			const { error, message, username, token } = data.authenticate

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
				setSuccess(message ? message : "Authenticated Successfully")
			} else {
				removeToken()
			}
			if (token) {
				setToken(token)
			}
		}
	}, [authenticateCallback, removeToken, setToken])

	useEffect(() => {
		authenticate()
	}, [authenticate])

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
				console.log(error)
				setLoginError(error)
				return
			}
			if (username && token) {
				setUsername(username)
				setSuccess(message ? message : "Login Successful")
				setToken(token)
			} else {
				removeToken()
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
			} else {
				removeToken()
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

		if (data && data.logout) {
			console.log(data)

			const { error, message } = data.logout

			if (error) {
				setLogoutError(error)
			} else if (message) {
				console.log(message)
			}
		}
		console.log("logged out")
		navigate("/auth")
		setUsername(null)
		removeToken()
	}

	return (
		<AuthContext.Provider value={{ username, logIn, signUp, logOut, loginError, signupError, logoutError, success, serverUrl }}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthProvider
