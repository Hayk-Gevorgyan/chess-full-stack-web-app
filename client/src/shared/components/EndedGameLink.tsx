import { endedChessGamePath } from "../../App"

const EndedGameLink = ({ result, id, classNames }: { result: string; id: string; classNames?: string }) => {
	return (
		<div
			className={`ended-game-link ${classNames}`}
			title={`replay game ${id}`}
			onClick={() => {
				const path = `${endedChessGamePath}/${id}`
				window.location.href = path
			}}
		>
			{result}
		</div>
	)
}

export default EndedGameLink
