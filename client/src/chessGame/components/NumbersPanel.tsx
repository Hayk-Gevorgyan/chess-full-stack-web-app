import NumberBlock from "./NumberBlock"

export default function NumbersPanel() {
	const numbersPanel: Array<JSX.Element> = []
	for (let number = 1; number <= 8; number++) {
		numbersPanel.push(<NumberBlock key={`number-block-${number}`} number={number} />)
	}

	return <div className="numbers-panel">{numbersPanel}</div>
}
