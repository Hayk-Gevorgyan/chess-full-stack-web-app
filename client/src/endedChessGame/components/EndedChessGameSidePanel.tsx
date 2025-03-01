import { PlayerColor } from "../../chessGame/types/types"
import ColorBlock from "../../chessGame/components/ColorBlock"
import EndedChessGameControls from "./EndedGameControls"

interface EndedChessGameSidePanelProps {
	onNextMove: () => void
	onPreviousMove: () => void
	turn: PlayerColor
}

const EndedChessGameSidePanel = ({ onNextMove, onPreviousMove, turn }: EndedChessGameSidePanelProps) => {
	return (
		<div className="chess-game-side-panel">
			<EndedChessGameControls onNextMove={onNextMove} onPreviousMove={onPreviousMove} />
			<ColorBlock color={turn} />
		</div>
	)
}

export default EndedChessGameSidePanel
