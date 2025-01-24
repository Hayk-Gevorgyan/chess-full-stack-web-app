const typeDefs = `#graphql
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
	}

	input MoveInput {
		from: String!
		to: String!
		promotion: String
	}
	
	type StartGameResult {
		id: ID!
        game: Game
	}

    type Query {
        game(id: ID!): Game
		endedGames(username: String!): [Game!]!
    }

	type Mutation {
		startGame(username: String!): StartGameResult
		makeMove(id: ID!, move: MoveInput!, username: String!): Boolean
		resign(id: ID!, username: String!): Boolean
		offerDraw(id: ID!, username: String!): Boolean
		acceptDraw(id: ID!, username: String!): Boolean
		denyDraw(id: ID!, username: String!): Boolean
	}

	type Subscription {
		gameUpdated(id: ID!, username: String): Game
	}
	
`

export default typeDefs
