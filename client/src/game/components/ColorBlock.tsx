import React, { useMemo } from "react"
import { Color } from "../types/types"

const ColorBlock = ({ color }: { color: Color }) => {
	const bgColor = useMemo<"white" | "black">(() => (color === Color.WHITE ? "white" : "black"), [color])
	const colorBlockStyle = {
		backgroundColor: bgColor,
		width: "50px",
		height: "50px",
		display: "flex",
		justifyContent: "center",
		border: "1px solid black",
		borderRadius: "2%",
	}
	return <div style={colorBlockStyle}></div>
}

export default ColorBlock
