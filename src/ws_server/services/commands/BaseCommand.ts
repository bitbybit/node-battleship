import { type WebSocket, type WebSocketServer } from 'ws'
import {
  type BaseCommandParams,
  type PayloadReceiveCommand,
  type PayloadSendCommand,
  type PlayerId,
  type Store
} from '../../interfaces'

export class BaseCommand {
  protected readonly server: WebSocketServer
  protected readonly store: Store

  constructor(params: BaseCommandParams) {
    this.server = params.server
    this.store = params.store
  }

  /**
   * @param message
   * @throws {Error}
   */
  protected async onReceive(message: PayloadReceiveCommand): Promise<void> {
    this.#log(message)
  }

  protected send({
    data,
    socket
  }: {
    data: PayloadSendCommand
    socket: WebSocket
  }): void {
    socket.send(JSON.stringify(data))
  }

  /**
   * @param socketId
   * @returns WebSocket
   * @throws {Error}
   */
  protected findSocketById(socketId: WebSocket['id']): WebSocket {
    const socket = Array.from(this.server.clients).find(
      ({ id }) => id === socketId
    )

    if (socket === undefined) {
      throw new Error(`Unable to find socket with id ${socketId}`)
    }

    return socket
  }

  /**
   * @param playerId
   * @returns WebSocket
   * @throws {Error}
   */
  protected findSocketByPlayerId(playerId: PlayerId): WebSocket {
    const playerAuthorized = this.store.playersAuthorized.find(
      (playerAuthorized) => playerAuthorized.playerId === playerId
    )

    if (playerAuthorized === undefined) {
      throw new Error(`Unable to find authorized player with id ${playerId}`)
    }

    return this.findSocketById(playerAuthorized.socketId)
  }

  #log(message: PayloadReceiveCommand): void {
    console.log('Received: %s - %s', message.type, JSON.stringify(message.data))
  }
}
