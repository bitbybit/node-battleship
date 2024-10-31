import { randomUUID } from 'node:crypto'
import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveShipAdd,
  type Ship
} from '../../../interfaces'
import { ShipStartGameCommand } from './StartGame'

export class ShipAddCommand extends BaseCommand implements Command {
  static readonly type = 'add_ships'

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
    message: PayloadReceiveCommand & { data: PayloadReceiveShipAdd }
    socket: WebSocket
  }): Promise<void> {
    const { gameId, ships, indexPlayer: playerId } = message.data

    const game = this.findGameById(gameId)

    if (game === undefined) {
      throw new Error(`Unable to find game with id ${gameId}`)
    }

    const player = this.findPlayerById(playerId)

    if (player === undefined) {
      throw new Error(`Unable to find player with id ${playerId}`)
    }

    try {
      const newShips: Ship[] = ships.map(
        ({ direction, length, position, type }) => ({
          direction,
          gameId,
          id: randomUUID(),
          length,
          life: length,
          playerId,
          position,
          type
        })
      )

      this.store.ships.push(...newShips)
    } catch {
      throw new Error(
        `The ships ${JSON.stringify(ships)} can not be added to the ships list`
      )
    }

    const shipsOfPlayers = this.findShipsOfPlayersByGameId(gameId)
    const hasShips = shipsOfPlayers.length > 0

    if (hasShips) {
      const startGame = this.commandFinder.findByType(ShipStartGameCommand.type)

      await startGame.sendCommand({
        gameId
      })
    }
  }

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
