import { gql } from "@apollo/client"

export const PROFILE_QUERY = gql`
	query GetProfile($username: String!) {
		profile(username: $username) {
			username
			games {
				id
				white
				black
				state
			}
		}
	}
`

export const ENDED_GAMES_QUERY = gql`
	query GetEndedGames($username: String) {
		endedGames(username: $username) {
			id
			white
			black
			state
		}
	}
`
