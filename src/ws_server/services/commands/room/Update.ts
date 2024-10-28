import { BaseCommand } from '../BaseCommand'
import { type Command, type PayloadReceiveCommand } from '../../../interfaces'

export const type = 'update_room'

export class RoomUpdateCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(message: PayloadReceiveCommand): Promise<void> {
    await super.onReceive(message)
  }
}

export const roomUpdate = {
  [type]: RoomUpdateCommand
}
