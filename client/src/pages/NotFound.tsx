import React from "react"
import NavBar from "../shared/components/NavBar"
import Header from "../shared/components/Header"

const NotFound = () => {
	return (
		<div className="notfound-page-container">
			<NavBar />
			<div className="content">
				<Header name="Page Not Found" />
			</div>
		</div>
	)
}

export default NotFound
