import { randomUUID } from 'node:crypto'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type Game,
  PayloadSendRoomCreateGame,
  type Room
} from '../../../interfaces'

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
      throw new Error(`Unable to find non-empty room with id ${roomId}`)
    }

    const { id, player1Id, player2Id } = this.#createGameForRoom(room)
    const players = [player1Id, player2Id]

    for (const playerId of players) {
      const socket = this.findSocketByPlayerId(playerId)

      const data: PayloadSendRoomCreateGame = {
        idGame: id,
        idPlayer: playerId
      }

      this.send({
        message: {
          data,
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

    const newGame: Game = {
      id: randomUUID(),
      lastAttack: null,
      player1Id,
      player2Id
    }

    this.store.games.push(newGame)

    return newGame
  }
}
