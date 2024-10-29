import { randomUUID } from 'node:crypto'
import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceivePlayerLogin,
  type PayloadSendPlayerLogin,
  type Player,
  type PlayerAuthorized
} from '../../../interfaces'
import { isValidPlayerName, isValidPlayerPassword } from '../../../validation'
import { RoomUpdateCommand } from '../room/Update'

export class PlayerLoginCommand extends BaseCommand implements Command {
  static readonly type = 'reg'

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
    message: PayloadReceiveCommand & { data: PayloadReceivePlayerLogin }
    socket: WebSocket
  }): Promise<void> {
    const payload = message.data

    try {
      const playerAuthorized = this.#authorize({
        payload,
        socket
      })

      const data: PayloadSendPlayerLogin = {
        error: false,
        errorText: '',
        index: playerAuthorized.playerId,
        name: payload.name
      }

      this.send({
        message: {
          data,
          id: 0,
          type: PlayerLoginCommand.type
        },
        socket
      })
    } catch (error) {
      const data: PayloadSendPlayerLogin = {
        error: true,
        errorText: (error as Error)?.message ?? 'Unknown error',
        index: '',
        name: payload.name
      }

      this.send({
        message: {
          data,
          id: 0,
          type: PlayerLoginCommand.type
        },
        socket
      })
    }

    const roomUpdate = this.commandFinder.findByType(RoomUpdateCommand.type)

    await roomUpdate.sendCommand()
  }

  /**
   * @param player
   * @returns Player
   * @throws {Error}
   */
  #createPlayer(player: Omit<Player, 'id'>): Player {
    const newPlayer = {
      id: randomUUID(),
      ...player
    }

    this.store.players.push(newPlayer)

    return newPlayer
  }

  #signUp(payload: PayloadReceivePlayerLogin): Player {
    const existingPlayer = this.findPlayerByName(payload.name)

    return existingPlayer === undefined
      ? this.#createPlayer({
          name: payload.name,
          password: payload.password
        })
      : existingPlayer
  }

  /**
   * @param params
   * @param params.payload
   * @param params.socket
   * @returns PlayerAuthorized
   * @throws {Error}
   */
  #authorize({
    payload,
    socket
  }: {
    payload: PayloadReceivePlayerLogin
    socket: WebSocket
  }): PlayerAuthorized {
    const { name, password } = payload

    if (!isValidPlayerName(name)) {
      throw new Error(`Player name is invalid`)
    }

    if (!isValidPlayerPassword(password)) {
      throw new Error(`Player password is invalid`)
    }

    const player = this.#signUp({
      name,
      password
    })

    const isValidCredentials =
      player.name === payload.name && player.password === payload.password

    if (!isValidCredentials) {
      throw new Error('Player already exists and credentials mismatch')
    }

    const playerAuthorized = {
      playerId: player.id,
      socketId: socket.id
    }

    this.store.playersAuthorized = Array.from(
      new Set([...this.store.playersAuthorized, playerAuthorized])
    )

    return playerAuthorized
  }

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
