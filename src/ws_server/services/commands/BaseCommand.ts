import { WebSocket, type WebSocketServer } from 'ws'
import {
  type BaseCommandParams,
  type PayloadReceiveCommand,
  type PayloadSendCommand,
  type Player,
  type PlayerId,
  type Room,
  type Store
} from '../../interfaces'

export abstract class BaseCommand {
  protected readonly server: WebSocketServer
  protected readonly store: Store

  constructor(params: BaseCommandParams) {
    this.server = params.server
    this.store = params.store
  }

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
    message: PayloadReceiveCommand
    socket: WebSocket
  }): Promise<void> {
    this.logOnReceive(message)

    await this.onReceiveAction({
      message,
      socket
    })
  }

  protected abstract onReceiveAction({
    message,
    socket
  }: {
    message: PayloadReceiveCommand
    socket: WebSocket
  }): Promise<unknown>

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

  protected findPlayerByName(playerName: Player['name']): Player | undefined {
    return this.store.players.find(({ name }) => name === playerName)
  }

  protected findPlayerById(playerId: Player['id']): Player | undefined {
    return this.store.players.find(({ id }) => id === playerId)
  }

  /**
   * @param socketId
   * @returns Player
   * @throws {Error}
   */
  protected findPlayerBySocketId(socketId: WebSocket['id']): Player {
    const playerAuthorized = this.store.playersAuthorized.find(
      (playerAuthorized) => playerAuthorized.socketId === socketId
    )

    if (playerAuthorized === undefined) {
      throw new Error(
        `Unable to find authorized player with socket id ${socketId}`
      )
    }

    const player = this.findPlayerById(playerAuthorized.playerId)

    if (player === undefined) {
      throw new Error(
        `Unable to find player with id ${playerAuthorized.playerId} and socket id ${socketId}`
      )
    }

    return player
  }

  protected findRoomById(roomId: Room['id']): Room | undefined {
    return this.store.rooms.find(
      ({ id, player2Id }) => id === roomId && player2Id !== null
    )
  }

  protected findEmptyRoomIndexById(roomId: Room['id']): number {
    return this.store.rooms.findIndex(
      ({ id, player2Id }) => id === roomId && player2Id === null
    )
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
