import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveRoomAddUser
} from '../../../interfaces'

export const type = 'add_user_to_room'

export class RoomAddUserCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(
    message: PayloadReceiveCommand | PayloadReceiveRoomAddUser
  ): Promise<void> {
    await super.onReceive(message as PayloadReceiveCommand)
  }
}

export const roomAddUser = {
  [type]: RoomAddUserCommand
}
