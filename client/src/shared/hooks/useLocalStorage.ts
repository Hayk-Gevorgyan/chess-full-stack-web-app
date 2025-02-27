import { useCallback } from "react"

export const useLocalStorage = (key: string) => {
	const setItem = useCallback(
		(value: unknown) => {
			try {
				window.localStorage.setItem(key, JSON.stringify(value))
			} catch (error) {
				console.log(error)
			}
		},
		[key]
	)

	const getItem = useCallback(() => {
		try {
			const value = window.localStorage.getItem(key)
			return value ? JSON.parse(value) : undefined
		} catch (error) {
			console.log(error)
		}
	}, [key])

	const removeItem = useCallback(() => {
		try {
			window.localStorage.removeItem(key)
		} catch (error) {
			console.log(error)
		}
	}, [key])

	return { setItem, getItem, removeItem }
}
