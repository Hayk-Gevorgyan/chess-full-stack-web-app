export const START_GAME_MUTATION = `#graphql
  mutation StartGame($username: String!) {
	startGame(username: $username) {
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

export const MAKE_MOVE_MUTATION = `#graphql
  mutation MakeMove($id: ID!, $move: MoveInput!, $username: String!) {
	makeMove(id: $id, move: $move, username: $username)
  }
`

export const RESIGN_MUTATION = `#graphql
  mutation Resign($id: ID!, $username: String!) {
	resign(id: $id, username: $username)
  }
`

export const OFFER_DRAW_MUTATION = `#graphql
  mutation OfferDraw($id: ID!, $username: String!) {
	offerDraw(id: $id, username: $username)
  }
`

export const ACCEPT_DRAW_MUTATION = `#graphql
  mutation AcceptDraw($id: ID!, $username: String!) {
	acceptDraw(id: $id, username: $username)
  }
`

export const DENY_DRAW_MUTATION = `#graphql
  mutation DenyDraw($id: ID!, $username: String!) {
	denyDraw(id: $id, username: $username)
  }
`

export const GAME_UPDATED_SUBSCIPTION_QUERY = `#graphql
	subscription GameUpdated($id: ID!, $username: String) {
		gameUpdated(id: $id, username: $username) {
			id
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
