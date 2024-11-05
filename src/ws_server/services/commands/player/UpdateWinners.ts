import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type Game,
  type PayloadReceiveCommand,
  type PayloadSendGameFinish,
  PayloadSendPlayerUpdateWinners,
  type Player
} from '../../../interfaces'

export class PlayerUpdateWinnersCommand extends BaseCommand implements Command {
  static readonly type = 'update_winners'

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
   * @param params.playerWinnerId
   * @throws {Error}
   */
  public async sendCommand({
    gameId,
    playerWinnerId
  }: {
    gameId: Game['id']
    playerWinnerId: Player['id']
  }): Promise<void> {
    const game = this.findGameById(gameId)

    if (game === undefined) {
      throw new Error(`Unable to find game with id ${gameId}`)
    }

    const players = [game.player1Id, game.player2Id]

    if (!players.includes(playerWinnerId)) {
      throw new Error(
        `Unable to find winner player with id ${playerWinnerId} for a game with id ${gameId}`
      )
    }

    const playerIndex = this.findPlayerIndexById(playerWinnerId)

    if (playerIndex === -1) {
      throw new Error(`Unable to find winner player with id ${playerWinnerId}`)
    }

    this.store.players[playerIndex].wins += 1

    for (const playerId of players) {
      const socket = this.findSocketByPlayerId(playerId)

      const data: PayloadSendPlayerUpdateWinners = this.findWinners().map(
        ({ name, wins }) => ({
          name,
          wins
        })
      )

      this.send({
        message: {
          data,
          id: 0,
          type: PlayerUpdateWinnersCommand.type
        },
        socket
      })
    }
  }
}
