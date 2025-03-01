import commonTypeDefs from "./commonTypeDefs"

const httpTypeDefs = `#graphql
  ${commonTypeDefs}

  type AuthPayload {
    error: String
    message: String
    username: String
    token: String
  }

  type AuthenticatePayload {
    error: String
    message: String
    username: String
    token: String
    game: Game
  }

  type StartGamePayload {
    id: ID!
    game: Game
  }

  type Query {
    game(id: ID!): Game
    endedGame(id: ID!): Game
    endedGames(username: String): [Game!]
  }

  type Mutation {
    authenticate: AuthenticatePayload!
    signup(username: String!, password: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    logout: AuthPayload!
    startGame: StartGamePayload
    makeMove(move: MoveInput!): Boolean
    resign: Boolean
    offerDraw: Boolean
    acceptDraw: Boolean
    denyDraw: Boolean
  }
`

export default httpTypeDefs
