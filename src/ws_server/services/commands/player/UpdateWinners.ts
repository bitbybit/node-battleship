import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import { type Command, type PayloadReceiveCommand } from '../../../interfaces'

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
}
