import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceivePlayerLogin
} from '../../../interfaces'

export const type = 'reg'

export class PlayerLoginCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(
    message: PayloadReceiveCommand | PayloadReceivePlayerLogin
  ): Promise<void> {
    await super.onReceive(message as PayloadReceiveCommand)
  }
}

export const playerLogin = {
  [type]: PlayerLoginCommand
}
