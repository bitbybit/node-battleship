import { WebSocket, type WebSocketServer } from 'ws'
import {
  type AbstractCommandFinder,
  type BaseCommandParams,
  type Game,
  type PayloadReceiveCommand,
  type PayloadSendCommand,
  type Player,
  type Room,
  type Ship,
  type Store
} from '../../interfaces'

export abstract class BaseCommand {
  protected readonly commandFinder: AbstractCommandFinder
  protected readonly server: WebSocketServer
  protected readonly store: Store

  constructor(params: BaseCommandParams) {
    this.commandFinder = params.commandFinder
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
    message,
    socket
  }: {
    message: PayloadSendCommand
    socket: WebSocket
  }): void {
    if (socket.readyState === WebSocket.OPEN) {
      const formattedMessage = this.#formatMessage(message)

      socket.send(formattedMessage)

      this.logOnSend(message)
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
  protected findSocketByPlayerId(playerId: Player['id']): WebSocket {
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

  protected findPlayerIndexById(playerId: Player['id']): number {
    return this.store.players.findIndex(({ id }) => id === playerId)
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

  protected findWinners(): Player[] {
    const winners = this.store.players.filter(({ wins }) => wins > 0)

    winners.sort((a, b) => a.wins - b.wins)

    return winners
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

  protected findGameById(gameId: Game['id']): Game | undefined {
    return this.store.games.find(({ id }) => id === gameId)
  }

  protected findGameIndexById(gameId: Game['id']): number {
    return this.store.games.findIndex(({ id }) => id === gameId)
  }

  protected findShipsOfPlayersByGameId(gameId: Game['id']): Ship[] {
    const game = this.findGameById(gameId)

    if (game === undefined) {
      return []
    }

    const ships = this.store.ships.filter(
      (ship) =>
        ship.gameId === gameId &&
        (ship.playerId === game.player1Id || ship.playerId === game.player2Id)
    )

    const hasBoth =
      ships.some(({ playerId }) => playerId === game.player1Id) &&
      ships.some(({ playerId }) => playerId === game.player2Id)

    if (!hasBoth) {
      return []
    }

    return ships
  }

  protected findShipsByGameAndPlayer(
    gameId: Game['id'],
    playerId: Player['id']
  ): Ship[] {
    return this.store.ships.filter(
      (ship) => ship.gameId === gameId && ship.playerId === playerId
    )
  }

  protected findShipIndexById(shipId: Ship['id']): number {
    return this.store.ships.findIndex(({ id }) => id === shipId)
  }

  protected findShipsAlive(gameId: Game['id'], playerId: Player['id']): Ship[] {
    return this.store.ships.filter(
      (ship) =>
        ship.gameId === gameId && ship.playerId === playerId && ship.life > 0
    )
  }

  protected findTurnIndexByGameId(gameId: Game['id']): number {
    return this.store.turns.findIndex((turn) => turn.gameId === gameId)
  }

  #formatMessage(message: PayloadSendCommand): string {
    return JSON.stringify({
      ...message,
      data: JSON.stringify(message.data)
    })
  }

  protected logOnReceive(message: PayloadReceiveCommand): void {
    console.log('RECEIVED: %s - %s', message.type, JSON.stringify(message))
  }

  protected logOnSend(message: PayloadSendCommand): void {
    console.log('SENT: %s - %s', message.type, this.#formatMessage(message))
  }
}
