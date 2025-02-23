const ToggleLoginSignup = ({ toggleAuthMode }: { toggleAuthMode: () => void }) => {
	return (
		<p className="toggle-text">
			Don't have an account?{" "}
			<button className="toggle-btn" onClick={toggleAuthMode}>
				Sign up here
			</button>
		</p>
	)
}

export default ToggleLoginSignup
