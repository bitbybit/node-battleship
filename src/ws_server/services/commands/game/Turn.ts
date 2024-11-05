import { randomUUID } from 'node:crypto'
import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type Game,
  type PayloadReceiveCommand,
  type PayloadSendGameTurn,
  type Turn
} from '../../../interfaces'

export class GameTurnCommand extends BaseCommand implements Command {
  static readonly type = 'turn'

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

    let turnPlayerId: Turn['playerId']

    const turnIndex = this.findTurnIndexByGameId(gameId)

    const players = [game.player1Id, game.player2Id]

    if (turnIndex === -1) {
      const randomPlayerIndex = Math.floor(Math.random() * players.length)

      const newTurn: Turn = {
        id: randomUUID(),
        gameId,
        playerId: players[randomPlayerIndex]
      }

      this.store.turns.push(newTurn)

      turnPlayerId = newTurn.playerId
    } else {
      if (game.lastAttack === 'miss') {
        this.store.turns[turnIndex].playerId =
          this.store.turns[turnIndex].playerId === game.player1Id
            ? game.player2Id
            : game.player1Id
      }

      turnPlayerId = this.store.turns[turnIndex].playerId
    }

    for (const playerId of players) {
      const socket = this.findSocketByPlayerId(playerId)

      const data: PayloadSendGameTurn = {
        currentPlayer: turnPlayerId
      }

      this.send({
        message: {
          data,
          id: 0,
          type: GameTurnCommand.type
        },
        socket
      })
    }
  }
}
