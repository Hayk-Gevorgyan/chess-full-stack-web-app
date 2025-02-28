import React from "react"

const ProfileLink = ({ username, classNames }: { username: string; classNames?: string }) => {
	return (
		<div
			className={`profile-link ${classNames}`}
			title={`go to ${username}'s profile`}
			onClick={() => {
				if (username === "username" || username === "opponent") return
				window.location.href = `/profile/${username}`
			}}
		>
			{username}
		</div>
	)
}

export default ProfileLink
