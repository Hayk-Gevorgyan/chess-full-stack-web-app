// import { useState, useCallback } from "react"

// interface UseGraphQLMutationOptions {
// 	url: string
// 	headers?: Record<string, string>
// }

// export function useGraphQLMutation({ url, headers }: UseGraphQLMutationOptions) {
// 	const [isFetching, setIsFetching] = useState(false)

// 	const sendMutation = useCallback(
// 		async (mutation: string, variables?: Record<string, any>) => {
// 			setIsFetching(true)

// 			try {
// 				const response = await fetch(url, {
// 					method: "POST",
// 					headers: {
// 						"Content-Type": "application/json",
// 						...headers,
// 					},
// 					body: JSON.stringify({
// 						query: mutation,
// 						variables,
// 					}),
// 				})

// 				const json = await response.json()
// 				return json
// 			} catch (error) {
// 				console.error("Network error:", error)
// 			} finally {
// 				setIsFetching(false)
// 			}
// 		},
// 		[url, headers]
// 	)

// 	return { sendMutation, isFetching }
// }

import { useState, useCallback } from "react"

interface UseGraphQLMutationOptions {
	url: string
	headers?: Record<string, string>
}

export function useGraphQLMutation<TData = any>({ url, headers }: UseGraphQLMutationOptions) {
	const [isFetching, setIsFetching] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const sendMutation = useCallback(
		async (mutation: string, variables?: Record<string, any>): Promise<TData | null> => {
			setIsFetching(true)
			setError(null)

			try {
				const response = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...headers,
					},
					body: JSON.stringify({ query: mutation, variables }),
				})

				if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

				const { data, errors } = await response.json()
				if (errors) throw new Error(errors.map((e: any) => e.message).join(", "))

				return data
			} catch (err) {
				setError(err as Error)
				console.error("GraphQL Mutation Error:", err)
				return null
			} finally {
				setIsFetching(false)
			}
		},
		[url, headers]
	)

	return { sendMutation, isFetching, error }
}
