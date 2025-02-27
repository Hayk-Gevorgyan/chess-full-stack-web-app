import { useState, useEffect } from "react"

interface PieceProps {
	type: string
	coordinate: string
	onDragStart: (coordinate: string) => void
}

export default function Piece({ type, coordinate, onDragStart }: PieceProps): JSX.Element {
	const [imgUrl, setImgUrl] = useState("")

	useEffect(() => {
		import(`../../assets/${type}.png`)
			.then((module) => {
				setImgUrl(module.default)
			})
			.catch((err) => {
				console.error("Error loading image:", err)
			})
	}, [type])

	return (
		<div className={`piece ${type}`} draggable={true} onDragStart={() => onDragStart(coordinate)}>
			{imgUrl && <img src={imgUrl} alt={type} className="piece-image" />}
		</div>
	)
}
