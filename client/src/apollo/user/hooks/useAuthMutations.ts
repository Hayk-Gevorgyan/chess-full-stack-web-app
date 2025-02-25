import { useMutation } from "@apollo/client"
import { LOGIN_MUTATION, SIGNUP_MUTATION, LOGOUT_MUTATION, AUTHENTICATE_MUTATION } from "../queries"
import { LoginResponse, SignupResponse, LogoutResponse, AuthVariables, AuthenticateResponse } from "../apolloTypes"

const useAuthMutations = () => {
	const [loginCallback, { loading: loginLoading, error: loginError }] = useMutation<LoginResponse, AuthVariables>(LOGIN_MUTATION)
	const [signupCallback, { loading: signupLoading, error: signupError }] = useMutation<SignupResponse, AuthVariables>(SIGNUP_MUTATION)
	const [logoutCallback, { loading: logoutLoading, error: logoutError }] = useMutation<LogoutResponse>(LOGOUT_MUTATION)
	const [authenticateCallback, { loading: authenticateLoading, error: authenticateError }] =
		useMutation<AuthenticateResponse>(AUTHENTICATE_MUTATION)

	return {
		loginCallback,
		signupCallback,
		logoutCallback,
		authenticateCallback,
		loginError,
		signupError,
		logoutError,
		authenticateError,
		loginLoading,
		signupLoading,
		logoutLoading,
		authenticateLoading,
	}
}

export default useAuthMutations
