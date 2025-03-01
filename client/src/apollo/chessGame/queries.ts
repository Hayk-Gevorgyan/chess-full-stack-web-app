import { gql } from "@apollo/client"

export const START_GAME_MUTATION = gql`
	mutation StartGame {
		startGame {
			id
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

export const MAKE_MOVE_MUTATION = gql`
	mutation MakeMove($move: MoveInput!) {
		makeMove(move: $move)
	}
`

export const RESIGN_MUTATION = gql`
	mutation Resign {
		resign
	}
`

export const OFFER_DRAW_MUTATION = gql`
	mutation OfferDraw {
		offerDraw
	}
`

export const ACCEPT_DRAW_MUTATION = gql`
	mutation AcceptDraw {
		acceptDraw
	}
`

export const DENY_DRAW_MUTATION = gql`
	mutation DenyDraw {
		denyDraw
	}
`

export const GAME_UPDATED_SUBSCRIPTION = gql`
	subscription GameUpdated {
		gameUpdated {
			white
			black
			state
			moves {
				from
				to
				promotion
			}
			drawOffer
		}
	}
`
