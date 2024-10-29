import { randomUUID } from 'node:crypto'
import { BaseCommand } from '../BaseCommand'
import { type Command, type PlayerId, type Room } from '../../../interfaces'

export class RoomCreateGameCommand extends BaseCommand implements Command {
  static readonly type = 'create_game'

  protected async onReceiveAction(): Promise<void> {}

  /**
   * @param params
   * @param params.roomId
   * @throws {Error}
   */
  public async sendCommand({ roomId }: { roomId: Room['id'] }): Promise<void> {
    const room = this.findRoomById(roomId)

    if (room === undefined) {
      throw new Error(`Can not find non-empty room with id ${roomId}`)
    }

    const game = {
      id: randomUUID(),
      player1Id: room.player1Id,
      player2Id: room.player2Id as PlayerId
    }

    const player1Socket = this.findSocketByPlayerId(room.player1Id)
    const player2Socket = this.findSocketByPlayerId(room.player2Id as PlayerId)

    this.store.games.push(game)

    this.send({
      data: {
        data: {
          idGame: game.id,
          idPlayer: room.player1Id
        },
        id: 0,
        type: RoomCreateGameCommand.type
      },
      socket: player1Socket
    })

    this.send({
      data: {
        data: {
          idGame: game.id,
          idPlayer: room.player2Id as PlayerId
        },
        id: 0,
        type: RoomCreateGameCommand.type
      },
      socket: player2Socket
    })
  }
}
