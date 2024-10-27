/**
 * Send for both players in the room, after they are connected to the room
 */
export type PayloadSendRoomCreateGame = {
  idGame: number | string
  idPlayer: number | string
}

export const type = 'create_game'
