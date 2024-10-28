import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveRoomCreate
} from '../../../interfaces'

export const type = 'create_room'

export class RoomCreateCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(
    message: PayloadReceiveCommand | PayloadReceiveRoomCreate
  ): Promise<void> {
    await super.onReceive(message as PayloadReceiveCommand)
  }
}

export const roomCreate = {
  [type]: RoomCreateCommand
}
