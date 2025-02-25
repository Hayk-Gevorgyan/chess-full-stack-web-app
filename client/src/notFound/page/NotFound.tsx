import NavBar from "../../shared/components/NavBar"
import Header from "../../shared/components/Header"

const NotFound = () => {
	return (
		<div className="notfound-page-container">
			<NavBar />
			<div className="content">
				<Header name="Page Not Found" showLogoutButton={false} />
			</div>
		</div>
	)
}

export default NotFound
