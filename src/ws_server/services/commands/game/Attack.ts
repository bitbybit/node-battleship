export type PayloadReceiveGameAttack = {
  gameId: number | string
  x: number
  y: number
  indexPlayer: number | string
}

/**
 * Should be sent after every shot,
 * miss and after kill sent miss for all cells around ship too
 */
export type PayloadSendGameAttack = {
  position: {
    x: number
    y: number
  }
  currentPlayer: number | string
  status: 'miss' | 'killed' | 'shot'
}

export const type = 'attack'
