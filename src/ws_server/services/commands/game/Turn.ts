/**
 * Info about player's turn
 * (send after game start and every attack, miss or kill result)
 */
export type PayloadSendGameTurn = {
  currentPlayer: number | string
}

export const type = 'turn'
