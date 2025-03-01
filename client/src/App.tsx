import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./home/page/HomePage"
import AuthPage from "./auth/page/AuthPage"
import ChessGamePage from "./chessGame/page/ChessGamePage"
import NotFound from "./notFound/page/NotFound"
import "./App.css"
import AuthProvider from "./shared/providers/AuthProvider"
import GameProvider from "./shared/providers/GameProvider"
import ProfilePage from "./profile/page/ProfilePage"
import EndedChessGamePage from "./endedChessGame/page/EndedChessGamePage"

export const authPath = "/auth"
export const homePath = "/"
export const profilePath = "/profile"
export const chessGamePath = "/chess-game"
export const notFoundPath = "*"
export const endedChessGamePath = "/ended-chess-game"

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<GameProvider>
					<Routes>
						<Route path={authPath} element={<AuthPage />} />
						<Route path={homePath} element={<HomePage />} />
						<Route path={chessGamePath} element={<ChessGamePage />} />
						<Route path={`${profilePath}/:username`} element={<ProfilePage />} />
						<Route path={`${endedChessGamePath}/:id`} element={<EndedChessGamePage />} />
						<Route path={notFoundPath} element={<NotFound />} />
					</Routes>
				</GameProvider>
			</AuthProvider>
		</BrowserRouter>
	)
}
