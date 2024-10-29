import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveGameAttackRandom
} from '../../../interfaces'

export class GameAttackRandomCommand extends BaseCommand implements Command {
  static readonly type = 'randomAttack'

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
    message: PayloadReceiveCommand & { data: PayloadReceiveGameAttackRandom }
    socket: WebSocket
  }): Promise<void> {
    this.logOnReceive(message as PayloadReceiveCommand)
  }
}
