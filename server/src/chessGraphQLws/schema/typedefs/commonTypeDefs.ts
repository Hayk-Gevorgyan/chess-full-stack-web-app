const commonTypeDefs = `#graphql
  type User {
	id: ID!
	username: String!
  }

  type Move {
	from: String!
	to: String!
	promotion: String
  }

  type Game {
	id: ID!
	white: String!
	black: String!
	state: String!
	moves: [Move!]!
	drawOffer: String
	token: String
  }

  type GamesArray {
	games: [Game!]
	token: String
  }

  input MoveInput {
	from: String!
	to: String!
	promotion: String
  }
`

export default commonTypeDefs
