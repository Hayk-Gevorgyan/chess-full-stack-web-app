import { useAuthContext } from "../hooks/useAuthContext"

const Header = ({ name, showLogoutButton }: { name: string; showLogoutButton?: boolean }) => {
	const { logOut } = useAuthContext()
	return (
		<header>
			<div className="name">{name}</div>
			{showLogoutButton && logOut && (
				<button className="logout-btn common-btn" onClick={logOut}>
					Logout
				</button>
			)}
		</header>
	)
}

export default Header
