import { gql } from "@apollo/client"

export const LOGIN_MUTATION = gql`
	mutation Login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			error
			message
			username
			token
		}
	}
`

export const SIGNUP_MUTATION = gql`
	mutation Signup($username: String!, $password: String!) {
		signup(username: $username, password: $password) {
			error
			message
			username
			token
		}
	}
`

export const LOGOUT_MUTATION = gql`
	mutation Logout {
		logout {
			error
			message
		}
	}
`

export const AUTHENTICATE_MUTATION = gql`
	mutation Authenticate {
		authenticate {
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
			token
		}
	}
`
