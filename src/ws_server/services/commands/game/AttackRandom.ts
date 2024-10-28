import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveGameAttackRandom
} from '../../../interfaces'

export const type = 'randomAttack'

export class GameAttackRandomCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(
    message: PayloadReceiveCommand | PayloadReceiveGameAttackRandom
  ): Promise<void> {
    await super.onReceive(message as PayloadReceiveCommand)
  }
}

export const gameAttackRandom = {
  [type]: GameAttackRandomCommand
}
