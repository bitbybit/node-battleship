import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveShipAdd
} from '../../../interfaces'

export const type = 'add_ships'

export class ShipAddCommand extends BaseCommand implements Command {
  /**
   * @param message
   * @throws {Error}
   */
  public async onReceive(
    message: PayloadReceiveCommand | PayloadReceiveShipAdd
  ): Promise<void> {
    await super.onReceive(message as PayloadReceiveCommand)
  }
}

export const shipAdd = {
  [type]: ShipAddCommand
}
