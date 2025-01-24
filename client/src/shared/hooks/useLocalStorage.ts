export const useLocalStorage = (key: string) => {
	const setItem = (value: unknown) => {
		try {
			window.localStorage.setItem(key, JSON.stringify(value))
		} catch (error) {
			console.log(error)
		}
	}

	const getItem = () => {
		try {
			const value = window.localStorage.getItem(key)
			return value ? JSON.parse(value) : undefined
		} catch (error) {
			console.log(error)
		}
	}

	const removeItem = () => {
		try {
			window.localStorage.removeItem(key)
		} catch (error) {
			console.log(error)
		}
	}

	return [setItem, getItem, removeItem]
}
