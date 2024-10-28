import { BaseCommand } from '../BaseCommand'
import { type Command, type PayloadReceiveCommand } from '../../../interfaces'

export const type = 'create_game'

export class RoomCreateGameCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(message: PayloadReceiveCommand): Promise<void> {
    await super.onReceive(message)
  }
}

export const roomCreateGame = {
  [type]: RoomCreateGameCommand
}
