import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadSendRoomUpdate,
  type Room
} from '../../../interfaces'

export class RoomUpdateCommand extends BaseCommand implements Command {
  static readonly type = 'update_room'

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
    message: PayloadReceiveCommand
    socket: WebSocket
  }): Promise<void> {
    this.logOnReceive(message)
  }

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {
    const data: PayloadSendRoomUpdate = this.store.rooms.map(
      this.#roomToData.bind(this)
    )

    this.server.clients.forEach((socket) => {
      this.send({
        data: {
          data,
          id: 0,
          type: RoomUpdateCommand.type
        },
        socket
      })
    })
  }

  /**
   * @param room
   * @param room.id
   * @param room.player1Id
   * @param room.player2Id
   * @returns PayloadSendRoomUpdate[0]
   * @throws {Error}
   */
  #roomToData({ id, player1Id, player2Id }: Room): PayloadSendRoomUpdate[0] {
    const player1 = this.findPlayerById(player1Id)

    if (player1 === undefined) {
      throw new Error('Found an empty room')
    }

    const roomUsers = [
      {
        name: player1.name,
        index: player1.id
      }
    ]

    if (player2Id !== null) {
      const player2 = this.findPlayerById(player2Id)

      if (player2 !== undefined) {
        roomUsers.push({
          name: player2.name,
          index: player2.id
        })
      }
    }

    return {
      roomId: id,
      roomUsers
    }
  }
}
