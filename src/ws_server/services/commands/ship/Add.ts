import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveShipAdd
} from '../../../interfaces'

export class ShipAddCommand extends BaseCommand implements Command {
  static readonly type = 'add_ships'

  /**
   * @param params
   * @param params.message
   * @param params.socket
   * @throws {Error}
   */
  protected async onReceiveAction({
    message,
    socket
  }: {
    message: PayloadReceiveCommand & { data: PayloadReceiveShipAdd }
    socket: WebSocket
  }): Promise<void> {}

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
