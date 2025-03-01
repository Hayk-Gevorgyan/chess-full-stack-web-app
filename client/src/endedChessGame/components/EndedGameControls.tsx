interface EndedChessGameControlsProps {
	onNextMove: () => void
	onPreviousMove: () => void
}
const EndedChessGameControls = ({ onNextMove, onPreviousMove }: EndedChessGameControlsProps) => {
	return (
		<div className="controls-container">
			<button className="common-btn" onClick={onNextMove}>
				Next Move
			</button>
			<button className="common-btn" onClick={onPreviousMove}>
				Prev Move
			</button>
		</div>
	)
}

export default EndedChessGameControls
