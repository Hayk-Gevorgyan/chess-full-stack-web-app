import { profilePath } from "../../App"

const ProfileLink = ({ username, classNames }: { username: string; classNames?: string }) => {
	return (
		<div
			className={`profile-link ${classNames}`}
			title={`go to ${username}'s profile`}
			onClick={() => {
				if (username === "username" || username === "opponent") return
				const path = `${profilePath}/${username}`
				window.location.href = path
			}}
		>
			{username}
		</div>
	)
}

export default ProfileLink
