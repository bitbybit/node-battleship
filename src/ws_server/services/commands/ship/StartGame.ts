import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import { type Command, type PayloadReceiveCommand } from '../../../interfaces'

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
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
