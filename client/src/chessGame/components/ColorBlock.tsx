import React, { useMemo } from "react"
import { PlayerColor } from "../types/types"

const ColorBlock = ({ color }: { color: PlayerColor }) => {
	const bgColor = useMemo<"white" | "black">(() => (color === PlayerColor.WHITE ? "white" : "black"), [color])
	const colorBlockStyle = {
		backgroundColor: bgColor,
	}
	return <div className="color-block" style={colorBlockStyle}></div>
}

export default ColorBlock
