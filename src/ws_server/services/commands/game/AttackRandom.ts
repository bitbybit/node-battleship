import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveGameAttackRandom
} from '../../../interfaces'
import { GameAttackCommand } from './Attack'

export class GameAttackRandomCommand extends BaseCommand implements Command {
  static readonly type = 'randomAttack'

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
    message: PayloadReceiveCommand & { data: PayloadReceiveGameAttackRandom }
    socket: WebSocket
  }): Promise<void> {
    const { gameId, indexPlayer: playerId } = message.data

    const x = this.#getRandomCoordinates('x')
    const y = this.#getRandomCoordinates('y')

    const gameAttack = this.commandFinder.findByType(GameAttackCommand.type)

    await gameAttack.sendCommand({
      gameId,
      playerId,
      playerSocket: socket,
      position: {
        x,
        y
      }
    })
  }

  #getRandomCoordinates(side: 'x' | 'y'): number {
    const max = side === 'x' ? 'xMax' : 'yMax'

    const coordinates = Array.from(
      { length: this.store.playDesk[max] + 1 },
      (_, index) => index++
    )

    const randomIndex = Math.floor(Math.random() * coordinates.length)

    return coordinates[randomIndex]
  }

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
