import { PlayerColor } from "../types/types"
import ColorBlock from "./ColorBlock"

interface PlayerBlockParams {
	color: PlayerColor
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
