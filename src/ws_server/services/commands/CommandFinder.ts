import { type CommandClass, type PayloadReceiveCommand } from '../../interfaces'
import { PlayerLoginCommand } from './player/Login'
import { PlayerUpdateWinnersCommand } from './player/UpdateWinners'
import { RoomCreateCommand } from './room/Create'
import { RoomAddUserCommand } from './room/AddUser'
import { RoomCreateGameCommand } from './room/CreateGame'
import { RoomUpdateCommand } from './room/Update'
import { ShipAddCommand } from './ship/Add'
import { ShipStartGameCommand } from './ship/StartGame'
import { GameAttackRandomCommand } from './game/AttackRandom'
import { GameAttackCommand } from './game/Attack'
import { GameTurnCommand } from './game/Turn'
import { GameFinishCommand } from './game/Finish'

export class CommandFinder {
  readonly #commands: CommandClass[]

  constructor() {
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
   * @returns CommandClass
   * @throws {Error}
   */
  public find(message: PayloadReceiveCommand): CommandClass {
    if (!this.#isValidMessage(message)) {
      throw new Error('Unknown message type')
    }

    const { type } = message

    const command = this.#commands.find(
      (commandClass) => commandClass.type === type
    )

    if (command === undefined) {
      throw new Error(`Command not found for message type ${type}`)
    }

    return command
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
