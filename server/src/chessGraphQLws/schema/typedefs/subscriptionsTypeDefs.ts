import commonTypeDefs from "./commonTypeDefs"

const subscriptionsTypeDefs = `#graphql
  ${commonTypeDefs}

	# Dummy Query type is required by the GraphQL spec.
	type Query {
    _empty: String
  }	

  type Subscription {
    gameUpdated: Game
  }
`

export default subscriptionsTypeDefs
