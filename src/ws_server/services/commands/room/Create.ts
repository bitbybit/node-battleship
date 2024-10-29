import { randomUUID } from 'node:crypto'
import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveRoomCreate,
  type Room
} from '../../../interfaces'
import { RoomUpdateCommand } from './Update'

export class RoomCreateCommand extends BaseCommand implements Command {
  static readonly type = 'create_room'

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
    message: PayloadReceiveCommand & { data: PayloadReceiveRoomCreate }
    socket: WebSocket
  }): Promise<void> {
    this.logOnReceive(message as PayloadReceiveCommand)

    this.#createRoom(socket)

    const updateRoom = new RoomUpdateCommand({
      server: this.server,
      store: this.store
    })

    await updateRoom.sendCommand()
  }

  #createRoom(socket: WebSocket): Room {
    const player = this.findPlayerBySocketId(socket.id)

    const newRoom = {
      id: randomUUID(),
      player1Id: player.id,
      player2Id: null
    }

    this.store.rooms.push(newRoom)

    return newRoom
  }
}
