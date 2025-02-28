import ProfileLink from "../../shared/components/ProfileLink"
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
			<ProfileLink username={username} classNames="username" />
		</div>
	)
}

export default PlayerBlock
