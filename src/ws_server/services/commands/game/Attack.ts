import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveGameAttack
} from '../../../interfaces'

export const type = 'attack'

export class GameAttackCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(
    message: PayloadReceiveCommand | PayloadReceiveGameAttack
  ): Promise<void> {
    await super.onReceive(message as PayloadReceiveCommand)
  }
}

export const gameAttack = {
  [type]: GameAttackCommand
}
