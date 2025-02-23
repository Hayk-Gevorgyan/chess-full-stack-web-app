import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AuthPage from "./auth/page/AuthPage"
import ChessGamePage from "./chessGame/page/ChessGamePage"
import NotFound from "./pages/NotFound"
import "./App.css"
import AuthProvider from "./shared/providers/AuthProvider"
import GameProvider from "./shared/providers/GameProvider"

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<GameProvider>
					<Routes>
						<Route path="/auth" element={<AuthPage />} />

						<Route path="/" element={<HomePage />} />
						<Route path="/game" element={<ChessGamePage />} />

						<Route path="*" element={<NotFound />} />
					</Routes>
				</GameProvider>
			</AuthProvider>
		</BrowserRouter>
	)
}
