/**
 * Add ships to the game board
 */
export type PayloadReceiveShipAdd = {
  gameId: number | string
  ships: Array<{
    position: {
      x: number
      y: number
    }
    direction: boolean
    length: number
    type: 'small' | 'medium' | 'large' | 'huge'
  }>
  indexPlayer: number | string
}

export const type = 'add_ships'
