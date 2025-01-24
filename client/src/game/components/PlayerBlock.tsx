import React from "react"
import { Color } from "../types/types"
import ColorBlock from "./ColorBlock"
import "../styles/PlayerBlock.css"

interface PlayerBlockParams {
	color: Color
	username: string
}
const PlayerBlock = ({ color, username }: PlayerBlockParams) => {
	return (
		<div className="player-block">
			<ColorBlock color={color} />
			<div className="username">{username}</div>
		</div>
	)
}

export default PlayerBlock
