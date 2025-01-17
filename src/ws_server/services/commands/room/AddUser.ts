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
  protected async onReceiveAction({
    message,
    socket
  }: {
    message: PayloadReceiveCommand & { data: PayloadReceiveRoomAddUser }
    socket: WebSocket
  }): Promise<void> {
    const { indexRoom: roomId } = message.data

    this.#enterRoom(socket, roomId)

    const roomUpdate = this.commandFinder.findByType(RoomUpdateCommand.type)

    await roomUpdate.sendCommand()

    const createGame = this.commandFinder.findByType(RoomCreateGameCommand.type)

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

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
