const commonTypeDefs = `#graphql
  type User {
	id: ID!
	username: String!
	#state property could be added for in game state management
  }

  type Move {
	from: String!
	to: String!
	promotion: String
  }

  type Game {
	id: ID!
	white: String! #player types could be set to User
	black: String! #
	state: String!
	moves: [Move!]!
	drawOffer: String
  }

  input MoveInput {
	from: String!
	to: String!
	promotion: String
  }
`

export default commonTypeDefs
