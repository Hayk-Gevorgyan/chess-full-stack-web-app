import { gql } from "@apollo/client"

export const LOGIN_MUTATION = gql`
	mutation Login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			error
			message
			token
			username
		}
	}
`

export const SIGNUP_MUTATION = gql`
	mutation Signup($username: String!, $password: String!) {
		signup(username: $username, password: $password) {
			error
			message
			token
			username
		}
	}
`

export const LOGOUT_MUTATION = gql`
	mutation Logout {
		logout {
			error
			message
			username
		}
	}
`

export const RECONNECT_MUTATION = gql`
	mutation Reconnect {
		reconnect {
			error
			message
			username
			game {
				id
				white
				black
				moves {
					from
					to
					promotion
				}
				state
			}
		}
	}
`
