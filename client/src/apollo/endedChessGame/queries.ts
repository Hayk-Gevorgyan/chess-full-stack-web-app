import { gql } from "@apollo/client"

export const ENDED_GAME_QUERY = gql`
	query GetEndedGames($id: ID!) {
		endedGame(id: $id) {
			id
			white
			black
			state
			moves {
				from
				to
				promotion
			}
		}
	}
`
