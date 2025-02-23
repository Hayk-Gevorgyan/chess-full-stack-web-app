export default function NumberBlock({ number }: { number: number }): JSX.Element {
	return <div className="number-block">{number.toString()}</div>
}
