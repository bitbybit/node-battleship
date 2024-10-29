import { randomUUID } from 'node:crypto'
import { BaseCommand } from '../BaseCommand'
import { type Command, type Game, type Room } from '../../../interfaces'

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

    const { id, player1Id, player2Id } = this.#createGameForRoom(room)
    const players = [player1Id, player2Id]

    for (const playerId of players) {
      const socket = this.findSocketByPlayerId(playerId)

      this.send({
        data: {
          data: {
            idGame: id,
            idPlayer: playerId
          },
          id: 0,
          type: RoomCreateGameCommand.type
        },
        socket
      })
    }
  }

  /**
   * @param room
   * @param room.id
   * @param room.player1Id
   * @param room.player2Id
   * @returns Game
   * @throws {Error}
   */
  #createGameForRoom({ id, player1Id, player2Id }: Room): Game {
    if (player2Id === null) {
      throw new Error(
        `The room with id ${id} has only one player with id ${player1Id}`
      )
    }

    const newGame = {
      id: randomUUID(),
      player1Id,
      player2Id
    }

    this.store.games.push(newGame)

    return newGame
  }
}
