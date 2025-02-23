import { Color } from "../types/types"
import Controls from "./Controls"
import ColorBlock from "./ColorBlock"

interface ChessGameSidePanelProps {
	turn: Color
}

const ChessGameSidePanel = ({ turn }: ChessGameSidePanelProps) => {
	return (
		<div className="chess-game-side-panel">
			<Controls />
			<ColorBlock color={turn} />
		</div>
	)
}

export default ChessGameSidePanel
