import React, { useMemo } from "react"
import { Color } from "../types/types"

const ColorBlock = ({ color }: { color: Color }) => {
	const bgColor = useMemo<"white" | "black">(() => (color === Color.WHITE ? "white" : "black"), [color])
	const colorBlockStyle = {
		backgroundColor: bgColor,
	}
	return <div className="color-block" style={colorBlockStyle}></div>
}

export default ColorBlock
