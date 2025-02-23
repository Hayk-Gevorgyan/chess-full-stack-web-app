import { useMutation } from "@apollo/client"
import { StartGamePayload, MakeMoveVariables } from "../apolloTypes"
import {
	START_GAME_MUTATION,
	MAKE_MOVE_MUTATION,
	OFFER_DRAW_MUTATION,
	ACCEPT_DRAW_MUTATION,
	RESIGN_MUTATION,
	DENY_DRAW_MUTATION,
} from "../queries"

const useChessMutations = () => {
	const [startGame, { loading: startGameLoading, error: startGameError }] = useMutation<StartGamePayload>(START_GAME_MUTATION)
	const [makeMove, { loading: makeMoveLoading, error: makeMoveError }] = useMutation<any, MakeMoveVariables>(MAKE_MOVE_MUTATION)
	const [resign, { loading: resignLoading, error: resignError }] = useMutation(RESIGN_MUTATION)
	const [offerDraw, { loading: offerDrawLoading, error: offerDrawError }] = useMutation(OFFER_DRAW_MUTATION)
	const [acceptDraw, { loading: acceptDrawLoading, error: acceptDrawError }] = useMutation(ACCEPT_DRAW_MUTATION)
	const [denyDraw, { loading: denyDrawLoading, error: denyDrawError }] = useMutation(DENY_DRAW_MUTATION)

	return {
		startGame,
		makeMove,
		resign,
		offerDraw,
		acceptDraw,
		denyDraw,
		startGameLoading,
		startGameError,
		makeMoveLoading,
		makeMoveError,
		resignLoading,
		resignError,
		offerDrawLoading,
		offerDrawError,
		acceptDrawLoading,
		acceptDrawError,
		denyDrawLoading,
		denyDrawError,
		makeMoveInput: (data: MakeMoveVariables) => {
			const { move } = data
			return { move }
		},
	}
}

export default useChessMutations
