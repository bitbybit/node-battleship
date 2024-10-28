import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveGameAttack
} from '../../../interfaces'

export const type = 'attack'

export class GameAttackCommand extends BaseCommand implements Command {
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
    message: PayloadReceiveCommand & { data: PayloadReceiveGameAttack }
    socket: WebSocket
  }): Promise<void> {
    this.logOnReceive(message as PayloadReceiveCommand)
  }
}

export const gameAttack = {
  [type]: GameAttackCommand
}
