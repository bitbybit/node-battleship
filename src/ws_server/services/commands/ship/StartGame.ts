import { BaseCommand } from '../BaseCommand'
import { type Command, type PayloadReceiveCommand } from '../../../interfaces'

export const type = 'start_game'

export class ShipStartGameCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(message: PayloadReceiveCommand): Promise<void> {
    await super.onReceive(message)
  }
}

export const shipStartGame = {
  [type]: ShipStartGameCommand
}
