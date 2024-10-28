import { type CommandClass, type PayloadReceiveCommand } from '../../interfaces'
import { playerLogin } from './player/Login'
import { playerUpdateWinners } from './player/UpdateWinners'
import { roomCreate } from './room/Create'
import { roomAddUser } from './room/AddUser'
import { roomCreateGame } from './room/CreateGame'
import { roomUpdate } from './room/Update'
import { shipAdd } from './ship/Add'
import { shipStartGame } from './ship/StartGame'
import { gameAttackRandom } from './game/AttackRandom'
import { gameAttack } from './game/Attack'
import { gameTurn } from './game/Turn'
import { gameFinish } from './game/Finish'

export class CommandFinder {
  readonly #commands: {
    [type: string]: CommandClass
  } = {}

  constructor() {
    this.#commands = {
      ...playerLogin,
      ...playerUpdateWinners,

      ...roomCreate,
      ...roomAddUser,
      ...roomCreateGame,
      ...roomUpdate,

      ...shipAdd,
      ...shipStartGame,

      ...gameAttackRandom,
      ...gameAttack,
      ...gameTurn,
      ...gameFinish
    }
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

    const command = this.#commands[type]

    if (command === undefined) {
      throw new Error(`Command not found for message type ${type}`)
    }

    return this.#commands[type]
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
