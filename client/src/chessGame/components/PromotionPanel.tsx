import { MoveWrapper, PieceType } from "../types/types"
import Piece from "./Piece"
import classNames from "classnames"
import "../styles/PromotionPanel.css"
import { lnToCoordinates } from "../chessValidation/helperFunctions"
import { useMemo } from "react"

export default function PromotionPanel({
	promotionInfo,
	onSelect,
}: {
	promotionInfo: MoveWrapper | undefined
	onSelect: (promotion: PieceType) => void
}) {
	const pieces = useMemo(() => [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT], [])

	const toCoordinate = useMemo(() => {
		if (promotionInfo) {
			return lnToCoordinates(promotionInfo.to)
		}
	}, [promotionInfo])

	const promotionPanelStyles = useMemo(() => {
		if (toCoordinate) {
			const toX = toCoordinate[0]
			return promotionInfo?.turn === "w"
				? {
						transform: `translate(${toX * 50}px, 0)`,
				  }
				: {
						transform: `translate(${(7 - toX) * 50}px, 0)`,
				  }
		}
	}, [toCoordinate, promotionInfo])

	const classNamesPanel = classNames("promotion-panel", {
		"promotion-panel-white": promotionInfo?.turn === "w",
		"promotion-panel-black": promotionInfo?.turn === "b",
	})

	return (
		<div className={classNamesPanel} style={promotionPanelStyles}>
			{pieces.map((piece) => (
				<div key={piece} className="promotion-option" onClick={() => onSelect(piece)}>
					<Piece type={piece + promotionInfo?.turn} coordinate="" onDragStart={() => {}} />
				</div>
			))}
		</div>
	)
}
