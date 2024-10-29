import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveRoomAddUser,
  type Room
} from '../../../interfaces'
import { RoomUpdateCommand } from './Update'
import { RoomCreateGameCommand } from './CreateGame'

export class RoomAddUserCommand extends BaseCommand implements Command {
  static readonly type = 'add_user_to_room'

  /**
   * @param params
   * @param params.message
   * @param params.socket
   * @throws {Error}
   */
  public async onReceive({
    message,
    socket
  }: {
    message: PayloadReceiveCommand & { data: PayloadReceiveRoomAddUser }
    socket: WebSocket
  }): Promise<void> {
    this.logOnReceive(message as PayloadReceiveCommand)

    const { indexRoom: roomId } = message.data

    this.#enterRoom(socket, roomId)

    const updateRoom = new RoomUpdateCommand({
      server: this.server,
      store: this.store
    })

    await updateRoom.sendCommand()

    const createGame = new RoomCreateGameCommand({
      server: this.server,
      store: this.store
    })

    await createGame.sendCommand({
      roomId
    })
  }

  #enterRoom(socket: WebSocket, roomId: Room['id']): Room {
    const player = this.findPlayerBySocketId(socket.id)
    const roomIndex = this.findEmptyRoomIndexById(roomId)

    if (roomIndex === -1) {
      throw new Error(`Empty room with id ${roomId} not found`)
    }

    const room = this.store.rooms[roomIndex]

    if (room.player1Id === player.id || room.player2Id === player.id) {
      throw new Error(
        `Player with id ${player.id} has already been added to room with id ${roomId}`
      )
    }

    room.player2Id = player.id

    return room
  }
}
