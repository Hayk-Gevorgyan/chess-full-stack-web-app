import { Color } from "../types/types"
import Controls from "./Controls"
import "../styles/ChessGameSidePanel.css"
import ColorBlock from "./ColorBlock"

interface ChessGameSidePanelProps {
	turn: Color
}

const ChessGameSidePanel = ({ turn }: ChessGameSidePanelProps) => {
	return (
		<div className="chess-game-side-panel">
			<ColorBlock color={turn} />
			<Controls />
		</div>
	)
}

export default ChessGameSidePanel
