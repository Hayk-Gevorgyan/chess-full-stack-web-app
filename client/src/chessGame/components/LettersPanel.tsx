import LetterBlock from "./LetterBlock"

export default function LettersPanel() {
	const lettersPanel: Array<JSX.Element> = []
	for (let letter of "abcdefgh") {
		lettersPanel.push(<LetterBlock key={`letter-block-${letter}`} letter={letter} />)
	}

	return <div className="letters-panel">{lettersPanel}</div>
}
