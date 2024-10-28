import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveShipAdd
} from '../../../interfaces'

export const type = 'add_ships'

export class ShipAddCommand extends BaseCommand implements Command {
  /**
   * @param params
   * @param params.message
   * @param params.socket
   * @throws {Error}
   */
  public async onReceive({
    message,
    socket
  }: {
    message: PayloadReceiveCommand & { data: PayloadReceiveShipAdd }
    socket: WebSocket
  }): Promise<void> {
    this.logOnReceive(message as PayloadReceiveCommand)
  }
}

export const shipAdd = {
  [type]: ShipAddCommand
}
