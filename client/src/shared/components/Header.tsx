import "../styles/Header.css"

const Header = ({ name }: { name: string }) => {
	return (
		<header>
			<div>{name}</div>
		</header>
	)
}

export default Header
