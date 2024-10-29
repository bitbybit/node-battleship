import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveGameAttack
} from '../../../interfaces'

export class GameAttackCommand extends BaseCommand implements Command {
  static readonly type = 'attack'

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
    message: PayloadReceiveCommand & { data: PayloadReceiveGameAttack }
    socket: WebSocket
  }): Promise<void> {}

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
