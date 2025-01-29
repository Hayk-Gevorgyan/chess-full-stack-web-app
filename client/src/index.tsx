import ReactDOM from "react-dom/client"
import App from "./App"
import "./App.css"
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client"

const client = new ApolloClient({ uri: "http://localhost:56789/graphql", cache: new InMemoryCache() })

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>
)
