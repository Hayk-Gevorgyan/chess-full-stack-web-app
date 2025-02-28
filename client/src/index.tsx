import ReactDOM from "react-dom/client"
import App from "./App"
import "./App.css"
import { ApolloClient, InMemoryCache, split, HttpLink, ApolloProvider, ApolloLink } from "@apollo/client"
import { getMainDefinition } from "@apollo/client/utilities"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { setContext } from "@apollo/client/link/context"
import { createClient } from "graphql-ws"

const isProduction = false
// process.env.REACT_APP_NODE_ENV === "production"

const localhostUrl = process.env.REACT_APP_LOCALHOST_SERVER_PATH || "http://localhost:56789"

const ngrokUrl = process.env.REACT_APP_NGROK_SERVER_PATH || localhostUrl

const graphqlHttpServerPath = process.env.REACT_APP_GRAPHQL_HTTP_SERVER_PATH || "graphql"

const graphqlSubscriptionsPath = process.env.REACT_APP_GRAPHQL_SUBSCRIPTIONS_SERVER_PATH || "subscriptions"

const httpUrl = isProduction ? `${ngrokUrl}/${graphqlHttpServerPath}` : `${localhostUrl}/${graphqlHttpServerPath}`

const subscriptionsUrl = isProduction ? `${ngrokUrl}/${graphqlSubscriptionsPath}` : `${localhostUrl}/${graphqlSubscriptionsPath}`

console.log({ isProduction, ngrokUrl, httpUrl, subscriptionsUrl })
// This authLink adds the current token from localStorage to every request.
const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem("token")
	return {
		headers: {
			...headers,
			"x-access-token": token ? token : undefined,
		},
	}
})

// This refreshTokenLink inspects HTTP responses for a new token in the "x-refresh-token" header.
// If a new token is found, it updates localStorage.
const refreshTokenLink = new ApolloLink((operation, forward) => {
	return forward(operation).map((result) => {
		const { response } = operation.getContext()
		if (response && response.headers) {
			const newToken = response.headers.get("x-refresh-token")
			if (newToken) {
				console.log("Received new token:", newToken)
				localStorage.setItem("token", newToken)
			}
		}
		return result
	})
})

// Create an HTTP link for queries and mutations.
const httpLink = new HttpLink({
	uri: httpUrl,
})

// Compose the HTTP link with auth and refresh functionality.
const authedHttpLink = refreshTokenLink.concat(authLink).concat(httpLink)

// Create a WebSocket link for subscriptions.
const wsLink = new GraphQLWsLink(
	createClient({
		url: subscriptionsUrl,
		connectionParams: () => {
			const token = localStorage.getItem("token")
			return {
				"x-access-token": token ? token : undefined,
			}
		},
	})
)

// Split links: route subscription operations to the wsLink, and the rest to the authedHttpLink.
const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query)
		return definition.kind === "OperationDefinition" && definition.operation === "subscription"
	},
	wsLink,
	authedHttpLink
)

const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
})

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>
)
