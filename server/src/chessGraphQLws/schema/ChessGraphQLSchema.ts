import { makeExecutableSchema } from "@graphql-tools/schema"
import httpTypeDefs from "./typedefs/httpTypeDefs"
import subscriptionsTypeDefs from "./typedefs/subscriptionsTypeDefs"
import httpResolvers from "./resolvers/httpResolvers"
import subscriptionsResolvers from "./resolvers/subscriptionsResolvers"

export const httpSchema = makeExecutableSchema({ typeDefs: httpTypeDefs, resolvers: httpResolvers })

export const subscriptionsSchema = makeExecutableSchema({ typeDefs: subscriptionsTypeDefs, resolvers: subscriptionsResolvers })
