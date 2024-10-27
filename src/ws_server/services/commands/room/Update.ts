/**
 * Update room state (send rooms list, where only one player inside)
 */
export type PayloadSendRoomUpdate = Array<{
  roomId: number | string
  roomUsers: Array<{
    name: string
    index: number | string
  }>
}>

export const type = 'update_room'
