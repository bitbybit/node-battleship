import { type WebSocketServer } from 'ws'
import {
  type AbstractCommandFinder,
  type Command,
  type CommandClass,
  type CommandFinderParams,
  type PayloadReceiveCommand,
  type Store
} from '../interfaces'
import { PlayerLoginCommand } from './commands/player/Login'
import { PlayerUpdateWinnersCommand } from './commands/player/UpdateWinners'
import { RoomCreateCommand } from './commands/room/Create'
import { RoomAddUserCommand } from './commands/room/AddUser'
import { RoomCreateGameCommand } from './commands/room/CreateGame'
import { RoomUpdateCommand } from './commands/room/Update'
import { ShipAddCommand } from './commands/ship/Add'
import { ShipStartGameCommand } from './commands/ship/StartGame'
import { GameAttackRandomCommand } from './commands/game/AttackRandom'
import { GameAttackCommand } from './commands/game/Attack'
import { GameTurnCommand } from './commands/game/Turn'
import { GameFinishCommand } from './commands/game/Finish'
import { BaseCommand } from './commands/BaseCommand'

export class CommandFinder implements AbstractCommandFinder {
  readonly #server: WebSocketServer
  readonly #store: Store

  readonly #commands: CommandClass[]
  readonly #instances = new Map<string, Command>()

  constructor(params: CommandFinderParams) {
    this.#server = params.server
    this.#store = params.store

    this.#commands = [
      PlayerLoginCommand,
      PlayerUpdateWinnersCommand,
      RoomCreateCommand,
      RoomAddUserCommand,
      RoomCreateGameCommand,
      RoomUpdateCommand,
      ShipAddCommand,
      ShipStartGameCommand,
      GameAttackRandomCommand,
      GameAttackCommand,
      GameTurnCommand,
      GameFinishCommand
    ]
  }

  /**
   * @param message
   * @returns Command
   * @throws {Error}
   */
  public findByMessage(message: PayloadReceiveCommand): Command {
    if (!this.#isValidMessage(message)) {
      throw new Error('Unknown message type')
    }

    const { type } = message

    return this.findByType(type)
  }

  /**
   * @param type
   * @returns Command
   * @throws {Error}
   */
  public findByType(type: string): Command {
    const command = this.#commands.find(
      (commandClass) => commandClass.type === type
    )

    if (command === undefined) {
      throw new Error(`Command not found for message type ${type}`)
    }

    return this.#getInstance(command)
  }

  #getInstance(commandClass: CommandClass): Command {
    const hasInstance = this.#instances.has(commandClass.type)

    if (hasInstance) {
      const instance = this.#instances.get(commandClass.type)
      const isCommand = instance instanceof BaseCommand

      if (!isCommand) {
        throw new Error(
          `Class with a type ${commandClass.type} is not a Command class instance`
        )
      }

      return instance
    }

    const instance = new commandClass({
      commandFinder: this,
      server: this.#server,
      store: this.#store
    })

    this.#instances.set(commandClass.type, instance)

    return instance
  }

  #isValidMessage(message: {
    id?: unknown
    data?: unknown
    type?: unknown
  }): boolean {
    return (
      message?.id === 0 &&
      message?.data !== undefined &&
      typeof message?.type === 'string'
    )
  }
}
