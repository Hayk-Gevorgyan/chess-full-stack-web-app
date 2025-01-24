import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage"
import GamePage from "./pages/GamePage"
import NotFound from "./pages/NotFound"
import "./App.css"
import AuthProvider from "./shared/providers/AuthProvider"
import GameProvider from "./shared/providers/GameProvider"

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/auth" element={<AuthPage />} />
					<Route
						path="/game"
						element={
							<GameProvider>
								<GamePage />
							</GameProvider>
						}
					/>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}
