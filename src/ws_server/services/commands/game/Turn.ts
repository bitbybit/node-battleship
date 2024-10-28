import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import { type Command, type PayloadReceiveCommand } from '../../../interfaces'

export const type = 'turn'

export class GameTurnCommand extends BaseCommand implements Command {
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
}

export const gameTurn = {
  [type]: GameTurnCommand
}
