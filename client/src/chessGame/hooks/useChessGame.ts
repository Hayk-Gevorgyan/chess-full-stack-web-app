import { useState, useMemo, useEffect, useCallback } from "react"
import { initialBoardSetup, getPieceAt, getPieceColor, getPieceType, immitateFinalBoardAfterMove } from "../chessValidation/helperFunctions"
import { isCheck, getTurnMoves, isPromotion } from "../chessValidation/chessValidator"
import { GameState, Move, MoveWrapper, Board, PlayerColor, PieceType } from "../types/types"
import { useGameContext } from "../../shared/hooks/useGameContext"

export function useChessGame() {
	const { gameState, moves, me, myColor, opponent, opponentColor, makeMove } = useGameContext()
	const [promotionInfo, setPromotionInfo] = useState<MoveWrapper | undefined>()
	const [selectedSquare, setSelectedSquare] = useState<string | undefined>()
	const [isBoardFlipped, setIsBoardFlipped] = useState<boolean>(false)
	const board = useMemo<Board>(() => {
		let derivedBoard: Board = initialBoardSetup()
		moves.forEach((move) => {
			derivedBoard = immitateFinalBoardAfterMove(derivedBoard, move)
		})
		return derivedBoard
	}, [moves])

	const turn = useMemo<PlayerColor>(() => (moves.length % 2 === 0 ? PlayerColor.WHITE : PlayerColor.BLACK), [moves])

	const turnMoves = useMemo<MoveWrapper[]>(() => {
		const moves = getTurnMoves(turn, board)
		return moves
	}, [turn, board])

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
		if (myColor === PlayerColor.WHITE) {
			setIsBoardFlipped(false)
		}
		if (myColor === PlayerColor.BLACK) {
			setIsBoardFlipped(true)
		}
	}, [myColor])

	/**
	 * Handles a click on a coordinate if the game state is started.
	 * If no selected square is defined and the piece belongs to the player clicking on the square, sets the selected square to the coordinate.
	 * If selected square is defined and the coordinates are the same sets the selected square to undefined, otherwise takes the piece from the board and if the piece is of the same color sets the selected square to coordinate,
	 * otherwise takes the slected piece from the board and checks if the other square is a valid move of the selected piece and is it a promotion.
	 * If its a promotion the promotion info is set to that valid moves which calls promotion handler, after that the move is sent to the server
	 */
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
							setPromotionInfo(validMove)
							return
						} else {
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

	const handleDragStart = useCallback(
		(coordinate: string) => {
			if (gameState !== GameState.STARTED) return
			const piece = getPieceAt(coordinate, board)
			if (!piece || getPieceColor(piece) !== myColor) return
			setSelectedSquare(coordinate)
		},
		[gameState, board, myColor]
	)

	const handleDrop = useCallback(
		(coordinate: string) => {
			if (!selectedSquare) return

			if (selectedSquare === coordinate) {
				// Dropping on the same square cancels the move
				setSelectedSquare(undefined)
				return
			}

			const newPiece = getPieceAt(coordinate, board)
			if (newPiece && getPieceColor(newPiece) === myColor) {
				// Dropping on your own piece resets selection
				setSelectedSquare(coordinate)
				return
			}

			const selectedPieceType = getPieceType(getPieceAt(selectedSquare, board))
			const validMove = turnMoves.find((m) => m.from === selectedSquare && m.to === coordinate && m.piece === selectedPieceType)

			if (validMove) {
				if (isPromotion(validMove)) {
					setPromotionInfo(validMove)
					return
				} else {
					const move: Move = { from: selectedSquare, to: coordinate }
					makeMove(move)
				}
			}
			setSelectedSquare(undefined)
		},
		[selectedSquare, board, myColor, turnMoves, makeMove]
	)

	/**
	 * takes a piece and sets the promotionInfo.promotion to that if piece type is present
	 */
	const handlePromotionSelect = useCallback(
		(promotion: PieceType) => {
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
			setPromotionInfo(undefined)
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
		handleDragStart,
		handleDrop,
	}
}
