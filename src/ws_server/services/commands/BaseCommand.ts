import { WebSocket, type WebSocketServer } from 'ws'
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

  protected send({
    data,
    socket
  }: {
    data: PayloadSendCommand
    socket: WebSocket
  }): void {
    if (socket.readyState === WebSocket.OPEN) {
      const formatted = this.#formatForSending(data)

      socket.send(formatted)

      this.logOnSend(data)
    }
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

  #formatForSending(message: PayloadSendCommand): string {
    return JSON.stringify({
      ...message,
      data: JSON.stringify(message.data)
    })
  }

  protected logOnReceive(message: PayloadReceiveCommand): void {
    console.log('Received: %s - %s', message.type, JSON.stringify(message))
  }

  protected logOnSend(message: PayloadSendCommand): void {
    console.log('Sent: %s - %s', message.type, this.#formatForSending(message))
  }
}
