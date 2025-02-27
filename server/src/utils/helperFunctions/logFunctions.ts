export function logFunctionExecution(fn: Function) {
	return function (this: any, ...args: any[]) {
		// Explicitly typing 'this' as 'any'

		const loggedArgs = args.filter((arg) => !Array.isArray(arg))
		console.log(`Function: ${fn.name} started with parameters:`, loggedArgs)
		const startTime = Date.now()

		// Call the original function
		const result = fn.apply(this, args)

		// If the function is asynchronous, handle promises
		if (result instanceof Promise) {
			return result.then((res) => {
				const endTime = Date.now()
				console.log(`Function: ${fn.name} ended. Time taken: ${endTime - startTime}ms`)
				return res
			})
		}

		const endTime = Date.now()
		console.log(`Function: ${fn.name} ended. Time taken: ${endTime - startTime}ms`)
		return result
	}
}
