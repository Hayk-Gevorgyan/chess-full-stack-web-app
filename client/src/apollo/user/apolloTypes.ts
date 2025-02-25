export interface LoginResponse {
	login: {
		error: string | null
		message: string | null
		username: string | null
		token: string | null
	}
}

export interface SignupResponse {
	signup: {
		error: string | null
		message: string | null
		username: string | null
		token: string | null
	}
}

export interface LogoutResponse {
	logout: {
		error: string | null
		message: string | null
	}
}

export interface AuthenticateResponse {
	authenticate: {
		error: string | null
		message: string | null
		username: string | null
		token: string | null
	}
}

export interface AuthVariables {
	username: string
	password: string
}
