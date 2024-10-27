/**
 * Add user to room (add yourself to somebody's room,
 * then remove the room from available rooms list)
 */
export type PayloadReceiveRoomAddUser = {
  indexRoom: number | string
}

export const type = 'add_user_to_room'
