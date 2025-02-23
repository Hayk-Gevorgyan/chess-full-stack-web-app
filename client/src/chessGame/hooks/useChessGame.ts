import { useState, useMemo, useEffect, useCallback } from "react"
// import useWebsocket from "../../shared/hooks/useWebsocket" // Assuming you have this custom hook
import { initialBoardSetup, getPieceAt, getPieceColor, getPieceType } from "../chessValidation/helperFunctions"
import { isCheck, getTurnMoves, immitateBoardAfterMove, isPromotion } from "../chessValidation/chessValidator"
import { GameState, Move, MoveWrapper, Board, Color, Piece } from "../types/types"
import { useGameContext } from "../../shared/hooks/useGameContext"

export function useChessGame() {
	const { gameState, moves, me, myColor, opponent, opponentColor, makeMove } = useGameContext()
	const [promotionInfo, setPromotionInfo] = useState<MoveWrapper | undefined>()
	const [selectedSquare, setSelectedSquare] = useState<string | undefined>()
	const [isBoardFlipped, setIsBoardFlipped] = useState<boolean>(false)
	const board = useMemo<Board>(() => {
		let derivedBoard: Board = initialBoardSetup()
		moves.forEach((move) => {
			derivedBoard = immitateBoardAfterMove(derivedBoard, move)
		})
		return derivedBoard
	}, [moves])

	const turn = useMemo<Color>(() => (moves.length % 2 === 0 ? Color.WHITE : Color.BLACK), [moves])

	const turnMoves = useMemo<MoveWrapper[]>(() => getTurnMoves(turn, board), [turn, board])

	const pieceMoves = useMemo<MoveWrapper[]>(() => turnMoves.filter((move) => move.from === selectedSquare), [selectedSquare, turnMoves])

	const checkedSquare = useMemo<string | undefined>(() => isCheck(turn, board), [turn, board])

	// Effects
	useEffect(() => {
		setSelectedSquare(undefined)
	}, [turn, board])

	useEffect(() => {
		if (!selectedSquare) {
			setPromotionInfo(undefined)
		}
	}, [selectedSquare])

	useEffect(() => {
		if (myColor === Color.WHITE) {
			setIsBoardFlipped(false)
		}
		if (myColor === Color.BLACK) {
			setIsBoardFlipped(true)
		}
	}, [myColor])

	const handleSquareClick = useCallback(
		(coordinate: string) => {
			if (gameState !== GameState.STARTED) return

			if (!selectedSquare) {
				//clicked square for the first time
				const piece = getPieceAt(coordinate, board)
				if (!piece || getPieceColor(piece) !== myColor) return //no piece or not players piece

				setSelectedSquare(coordinate)
			} else {
				if (selectedSquare === coordinate) {
					//clicked the same square twice
					setSelectedSquare(undefined)
					return
				} else {
					const newPiece = getPieceAt(coordinate, board)
					if (newPiece && getPieceColor(newPiece) === myColor) {
						setSelectedSquare(coordinate)
						return
					}
					const selectedPieceType = getPieceType(getPieceAt(selectedSquare, board))
					const validMove = turnMoves.find(
						(m) => m.from === selectedSquare && m.to === coordinate && m.piece === selectedPieceType
					)
					if (validMove) {
						//on promotionInfo change PromotionPanel component will call handlePromotionSelect(promotion)
						if (isPromotion(validMove)) {
							console.log("isPromotion", validMove)
							setPromotionInfo(validMove)
							return
						} else {
							console.log("is not promotion", validMove)
							const move: Move = {
								from: selectedSquare,
								to: coordinate,
							}
							makeMove(move)
						}
					}
					setSelectedSquare(undefined)
				}
			}
		},
		[gameState, selectedSquare, board, myColor, turnMoves, setSelectedSquare, makeMove]
	)

	const handlePromotionSelect = useCallback(
		(promotion: Piece) => {
			setSelectedSquare(undefined)
			if (!promotionInfo) return
			if (promotion) {
				const move: Move = {
					from: promotionInfo.from,
					to: promotionInfo.to,
					promotion: promotion + promotionInfo.turn,
				}
				makeMove(move)
			}
		},
		[promotionInfo, makeMove]
	)

	return {
		board,
		turn,
		promotionInfo,
		me,
		myColor,
		opponent,
		opponentColor,
		gameState,
		isBoardFlipped,
		pieceMoves,
		selectedSquare,
		checkedSquare,
		handlePromotionSelect,
		handleSquareClick,
	}
}
