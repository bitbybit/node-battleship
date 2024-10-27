/**
 * Start game (only after server receives both player's ships positions)
 */
export type PayloadSendShipStartGame = {
  // Player's ships, not enemy's
  ships: Array<{
    position: {
      x: number
      y: number
    }
    direction: boolean
    length: number
    type: 'small' | 'medium' | 'large' | 'huge'
  }>
  currentPlayerIndex: number | string
}

export const type = 'start_game'
