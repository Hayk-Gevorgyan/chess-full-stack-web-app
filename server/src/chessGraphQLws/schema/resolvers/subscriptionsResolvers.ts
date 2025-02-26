// src/graphql/resolvers/subscriptionResolvers.ts
import { AuthContext } from "../../controllers/AuthController"
import { gameController } from "../../../../index"
import { GraphQLError } from "graphql"

const subscriptionsResolvers = {
	Subscription: {
		gameUpdated: {
			subscribe: async (_: any, __: any, context: AuthContext) => {
				if (!context?.user) {
					throw new GraphQLError("You must be logged in to subscribe.", {
						extensions: { code: "UNAUTHENTICATED" },
					})
				}
				const username = context.user.username
				return gameController.subscribeToGameUpdated(username)
			},
		},
	},
}

export default subscriptionsResolvers
