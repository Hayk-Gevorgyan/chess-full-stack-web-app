import { createContext } from "react"

export interface AuthContextProps {
	username?: string
	loginError: string | null
	signupError: string | null
	logoutError: string | null
	success: string | null
	logIn: (username: string, password: string) => Promise<void>
	signUp: (username: string, password: string, passwordRepeat: string) => Promise<void>
	logOut: () => Promise<void>
	serverUrl: string | null
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined)
