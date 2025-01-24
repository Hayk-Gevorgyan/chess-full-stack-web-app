import React, { useState, useEffect } from "react"
import "../styles/Piece.css"

export default function Piece({ type }: { type: string }): JSX.Element {
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

	return <div className={`piece ${type}`}>{imgUrl && <img src={imgUrl} alt={type} className="piece-image" />}</div>
}
