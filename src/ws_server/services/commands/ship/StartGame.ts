import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type Game,
  type PayloadReceiveCommand,
  type PayloadSendShipStartGame,
  type Ship
} from '../../../interfaces'

export class ShipStartGameCommand extends BaseCommand implements Command {
  static readonly type = 'start_game'

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
    message: PayloadReceiveCommand
    socket: WebSocket
  }): Promise<void> {}

  /**
   * @param params
   * @param params.gameId
   * @throws {Error}
   */
  public async sendCommand({ gameId }: { gameId: Game['id'] }): Promise<void> {
    const game = this.findGameById(gameId)

    if (game === undefined) {
      throw new Error(`Unable to find game with id ${gameId}`)
    }

    const players = [game.player1Id, game.player2Id]

    for (const playerId of players) {
      const socket = this.findSocketByPlayerId(playerId)
      const ships = this.findShipsByGameAndPlayer(game.id, playerId)
      const hasShips = ships.length > 0

      if (!hasShips) {
        throw new Error(
          `Unable to find ships for game with id ${game.id} and player with id ${playerId}`
        )
      }

      const data: PayloadSendShipStartGame = {
        currentPlayerIndex: playerId,
        ships: ships.map(this.#shipsToData.bind(this))
      }

      this.send({
        message: {
          data,
          id: 0,
          type: ShipStartGameCommand.type
        },
        socket
      })
    }
  }

  #shipsToData({
    direction,
    length,
    position,
    type
  }: Ship): PayloadSendShipStartGame['ships'][0] {
    return {
      direction,
      length,
      position,
      type
    }
  }
}
