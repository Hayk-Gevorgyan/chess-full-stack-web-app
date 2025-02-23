import commonTypeDefs from "./commonTypeDefs"

const httpTypeDefs = `#graphql
  ${commonTypeDefs}

  type AuthPayload {
    error: String
    message: String
    username: String
    token: String
  }

  type ReconnectPayload {
    error: String
    message: String
    username: String
    game: Game
    token: String
  }

  type StartGamePayload {
    id: ID!
    game: Game
    token: String
  }

  type Query {
    game(id: ID!): Game
    endedGames: GamesArray!
  }

  type Mutation {
    reconnect: ReconnectPayload!
    signup(username: String!, password: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    logout: AuthPayload!
    startGame: StartGamePayload
    makeMove(move: MoveInput!): String
    resign: String
    offerDraw: String
    acceptDraw: String
    denyDraw: String
  }
`

export default httpTypeDefs
