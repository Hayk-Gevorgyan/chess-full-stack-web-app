const EndedGameLink = ({ result, id, classNames }: { result: string; id: string; classNames?: string }) => {
	return (
		<div
			className={`ended-game-link ${classNames}`}
			title={`replay game ${id}`}
			onClick={() => {
				window.location.href = `/endedGame/${id}`
			}}
		>
			{result}
		</div>
	)
}

export default EndedGameLink
