import { BaseCommand } from '../BaseCommand'
import { type Command, type PayloadReceiveCommand } from '../../../interfaces'

export const type = 'turn'

export class GameTurnCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(message: PayloadReceiveCommand): Promise<void> {
    await super.onReceive(message)
  }
}

export const gameTurn = {
  [type]: GameTurnCommand
}
