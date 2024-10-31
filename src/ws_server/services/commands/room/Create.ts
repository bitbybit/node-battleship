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
  protected async onReceiveAction({
    message,
    socket
  }: {
    message: PayloadReceiveCommand & { data: PayloadReceiveRoomCreate }
    socket: WebSocket
  }): Promise<void> {
    this.#createRoom(socket)

    const roomUpdate = this.commandFinder.findByType(RoomUpdateCommand.type)

    await roomUpdate.sendCommand()
  }

  #createRoom(socket: WebSocket): Room {
    const player = this.findPlayerBySocketId(socket.id)

    const newRoom: Room = {
      id: randomUUID(),
      player1Id: player.id,
      player2Id: null
    }

    this.store.rooms.push(newRoom)

    return newRoom
  }

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
