import classNames from "classnames"
import "../styles/Square.css"

interface SquareParameters {
	letter: string
	number: number
	isSelected: boolean | null
	isValidMove: boolean | null
	isAttacked: boolean | null
	onClick: () => void
	onDrop?: () => void
	onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
	children: JSX.Element | undefined
}

export default function Square({
	letter,
	number,
	isSelected,
	isValidMove,
	isAttacked,
	onClick,
	onDrop,
	onDragOver,
	children,
}: SquareParameters): JSX.Element {
	const isWhite: boolean = (number + "abcdefgh".indexOf(letter)) % 2 === 0
	const squareClasses = classNames({
		"square-white": isWhite,
		"square-black": !isWhite,
		"square-selected": isSelected,
		"square-valid-move": isValidMove,
		"square-attacked": isAttacked,
	})
	return (
		<div className={squareClasses} onClick={onClick} onDrop={onDrop} onDragOver={onDragOver}>
			{children}
		</div>
	)
}
