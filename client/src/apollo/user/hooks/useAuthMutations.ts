import { useMutation } from "@apollo/client"
import { LOGIN_MUTATION, SIGNUP_MUTATION, LOGOUT_MUTATION, RECONNECT_MUTATION } from "../queries"
import { LoginResponse, SignupResponse, LogoutResponse, AuthVariables, ReconnectResponse } from "../apolloTypes"

const useAuthMutations = () => {
	const [loginCallback, { loading: loginLoading, error: loginError }] = useMutation<LoginResponse, AuthVariables>(LOGIN_MUTATION)
	const [signupCallback, { loading: signupLoading, error: signupError }] = useMutation<SignupResponse, AuthVariables>(SIGNUP_MUTATION)
	const [logoutCallback, { loading: logoutLoading, error: logoutError }] = useMutation<LogoutResponse>(LOGOUT_MUTATION)
	const [reconnectCallback, { loading: reconnectLoading, error: reconnectError }] = useMutation<ReconnectResponse>(RECONNECT_MUTATION)

	return {
		loginCallback,
		signupCallback,
		logoutCallback,
		reconnectCallback,
		loginError,
		signupError,
		logoutError,
		reconnectError,
		loginLoading,
		signupLoading,
		logoutLoading,
		reconnectLoading,
	}
}

export default useAuthMutations
