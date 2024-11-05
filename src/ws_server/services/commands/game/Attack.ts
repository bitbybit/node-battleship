import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type Game,
  type PayloadReceiveCommand,
  type PayloadReceiveGameAttack,
  type PayloadSendGameAttack,
  type Player,
  type Ship,
  type ShipPosition
} from '../../../interfaces'
import { GameTurnCommand } from './Turn'
import { GameFinishCommand } from './Finish'
import { PlayerUpdateWinnersCommand } from '../player/UpdateWinners'

export class GameAttackCommand extends BaseCommand implements Command {
  static readonly type = 'attack'

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
    message: PayloadReceiveCommand & { data: PayloadReceiveGameAttack }
    socket: WebSocket
  }): Promise<void> {
    const { gameId, x, y, indexPlayer: playerId } = message.data

    await this.#doAttack({
      gameId,
      playerId,
      playerSocket: socket,
      position: {
        x,
        y
      }
    })
  }

  /**
   * @param params
   * @param params.gameId
   * @param params.playerId
   * @param params.playerSocket
   * @param params.position
   * @throws {Error}
   */
  async #doAttack({
    gameId,
    playerId,
    playerSocket,
    position
  }: {
    gameId: Game['id']
    playerId: Player['id']
    playerSocket: WebSocket
    position: ShipPosition
  }): Promise<void> {
    this.#validateCoordinates(position)

    const { x, y } = position

    const gameIndex = this.findGameIndexById(gameId)

    if (gameIndex === -1) {
      throw new Error(`Unable to find game with id ${gameId}`)
    }

    const game = this.store.games[gameIndex]

    const player = this.findPlayerById(playerId)

    if (player === undefined) {
      throw new Error(`Unable to find player with id ${playerId}`)
    }

    this.#validatePlayerTurn({
      game,
      playerId
    })

    const playerOpposingId = this.#getPlayerOpposingId({
      game,
      playerId
    })

    const sockets = [playerSocket, this.findSocketByPlayerId(playerOpposingId)]

    const { status, ship } = this.#getShotResult({
      coordinates: {
        x,
        y
      },
      gameId: game.id,
      playerOpposingId
    })

    const isKilled = status === 'killed' && ship !== null

    if (isKilled) {
      this.#sendKilled({
        playerShootId: playerId,
        ship,
        sockets
      })

      this.store.games[gameIndex].lastAttack = 'killed'
    } else {
      this.#sendHitOrMiss({
        coordinates: {
          x,
          y
        },
        playerShootId: playerId,
        sockets,
        status
      })

      this.store.games[gameIndex].lastAttack = status
    }

    const shipsAlivePlayer = this.findShipsAlive(game.id, playerId)

    const shipsAlivePlayerOpposing = this.findShipsAlive(
      game.id,
      playerOpposingId
    )

    const isWinnerPlayer = shipsAlivePlayerOpposing.length === 0
    const isWinnerPlayerOpposing = shipsAlivePlayer.length === 0
    const isGameFinished = isWinnerPlayer || isWinnerPlayerOpposing

    if (isGameFinished) {
      const playerWinnerId = isWinnerPlayer ? playerId : playerOpposingId

      const gameFinish = this.commandFinder.findByType(GameFinishCommand.type)

      await gameFinish.sendCommand({
        gameId: game.id,
        playerWinnerId
      })

      const playerUpdateWinners = this.commandFinder.findByType(
        PlayerUpdateWinnersCommand.type
      )

      await playerUpdateWinners.sendCommand({
        playerWinnerId
      })
    } else {
      const gameTurn = this.commandFinder.findByType(GameTurnCommand.type)

      await gameTurn.sendCommand({
        gameId
      })
    }
  }

  #isCoordinateWithinPlayDesk(side: 'x' | 'y', coordinate: number): boolean {
    if (side === 'x') {
      return (
        coordinate >= this.store.playDesk.xMin &&
        coordinate <= this.store.playDesk.xMax
      )
    }

    return (
      coordinate >= this.store.playDesk.yMin &&
      coordinate <= this.store.playDesk.yMax
    )
  }

  /**
   * @param position
   * @throws {Error}
   */
  #validateCoordinates(position: ShipPosition) {
    let isInteger = false

    Object.values(position).forEach((coordinate) => {
      isInteger = Number.isInteger(coordinate)
    })

    const isValidX = this.#isCoordinateWithinPlayDesk('x', position.x)
    const isValidY = this.#isCoordinateWithinPlayDesk('y', position.y)

    const isValid = isInteger && isValidX && isValidY

    if (!isValid) {
      throw new Error('Coordinates position is wrong')
    }
  }

  /**
   * @param params
   * @param params.game
   * @param params.playerId
   * @throws {Error}
   */
  #validatePlayerTurn({
    game,
    playerId
  }: {
    game: Game
    playerId: Player['id']
  }) {
    const turnIndex = this.findTurnIndexByGameId(game.id)

    if (turnIndex === -1) {
      throw new Error(
        `Unable to find current turn for a game with id ${game.id}`
      )
    }

    const playerTurnId = this.store.turns[turnIndex].playerId

    if (playerTurnId !== playerId) {
      throw new Error(
        `Player with id ${playerId} is not allowed to make an attack in this turn`
      )
    }
  }

  /**
   * @param params
   * @param params.game
   * @param params.playerId
   * @throws {Error}
   * @returns string
   */
  #getPlayerOpposingId({
    game,
    playerId
  }: {
    game: Game
    playerId: Player['id']
  }): string {
    const isPlayer1 = game.player1Id === playerId
    const isPlayer2 = game.player2Id === playerId

    let playerOpposingId: string | undefined

    if (isPlayer1) {
      playerOpposingId = game.player2Id
    }

    if (isPlayer2) {
      playerOpposingId = game.player1Id
    }

    if (
      playerOpposingId === undefined ||
      this.findPlayerById(playerOpposingId) === undefined
    ) {
      throw new Error(
        `Unable to find opposing player for game with id ${game.id} and player with id ${playerId}`
      )
    }

    return playerOpposingId
  }

  /**
   * @param params
   * @param params.coordinates
   * @param params.coordinates.x
   * @param params.coordinates.y
   * @param params.gameId
   * @param params.playerOpposingId
   * @returns object
   * @throws {Error}
   */
  #getShotResult({
    coordinates,
    gameId,
    playerOpposingId
  }: {
    coordinates: {
      x: PayloadSendGameAttack['position']['x']
      y: PayloadSendGameAttack['position']['y']
    }
    gameId: Game['id']
    playerOpposingId: Player['id']
  }): {
    ship: Ship | null
    status: PayloadSendGameAttack['status']
  } {
    const ships = this.findShipsByGameAndPlayer(gameId, playerOpposingId)

    let ship: Ship | null = null
    let status: PayloadSendGameAttack['status']

    let isHit = false
    let isKilled = false

    for (const { direction, id, length, position } of ships) {
      const isVertical = direction

      const xMin = position.x
      const xMax = isVertical ? position.x : position.x + length - 1

      const yMin = position.y
      const yMax = isVertical ? position.y + length - 1 : position.y

      const isHitX = coordinates.x >= xMin && coordinates.x <= xMax
      const isHitY = coordinates.y >= yMin && coordinates.y <= yMax

      isHit = isHitX && isHitY

      const shipIndex = this.findShipIndexById(id)

      if (shipIndex === -1) {
        throw new Error(`Unable to find a ship with id ${id}`)
      }

      if (isHit) {
        this.store.ships[shipIndex].life -= 1
        ship = this.store.ships[shipIndex]
      }

      isKilled = isHit && this.store.ships[shipIndex].life === 0

      if (isHit || isKilled) {
        break
      }
    }

    if (isKilled) {
      status = 'killed'
    } else {
      if (isHit) {
        status = 'shot'
      } else {
        status = 'miss'
      }
    }

    return {
      status,
      ship
    }
  }

  #sendPositionStatusFor({
    coordinates,
    status,
    playerShootId,
    socket
  }: {
    coordinates: {
      x: PayloadSendGameAttack['position']['x']
      y: PayloadSendGameAttack['position']['y']
    }
    status: PayloadSendGameAttack['status']
    playerShootId: PayloadSendGameAttack['currentPlayer']
    socket: WebSocket
  }): void {
    const data: PayloadSendGameAttack = {
      position: {
        x: coordinates.x,
        y: coordinates.y
      },
      currentPlayer: playerShootId,
      status
    }

    this.send({
      message: {
        data,
        id: 0,
        type: GameAttackCommand.type
      },
      socket
    })
  }

  #sendHitOrMiss({
    coordinates,
    playerShootId,
    sockets,
    status
  }: {
    coordinates: {
      x: PayloadSendGameAttack['position']['x']
      y: PayloadSendGameAttack['position']['y']
    }
    playerShootId: PayloadSendGameAttack['currentPlayer']
    sockets: WebSocket[]
    status: PayloadSendGameAttack['status']
  }): void {
    for (const socket of sockets) {
      this.#sendPositionStatusFor({
        coordinates,
        status,
        playerShootId,
        socket
      })
    }
  }

  #sendKilledForSide({
    playerShootId,
    side,
    ship,
    socket
  }: {
    playerShootId: PayloadSendGameAttack['currentPlayer']
    side: 'x' | 'y'
    ship: Ship
    socket: WebSocket
  }): void {
    const isX = side === 'x'

    for (
      let posSide = ship.position[side];
      posSide <= ship.position[side] + ship.length - 1;
      posSide++
    ) {
      const coordinates = isX
        ? {
            x: posSide,
            y: ship.position.y
          }
        : {
            x: ship.position.x,
            y: posSide
          }

      this.#sendPositionStatusFor({
        coordinates,
        status: 'killed',
        playerShootId,
        socket
      })
    }

    const sideBefore = ship.position[side] - 1
    const sideAfter = ship.position[side] + ship.length

    if (this.#isCoordinateWithinPlayDesk(side, sideBefore)) {
      const coordinates = isX
        ? {
            x: sideBefore,
            y: ship.position.y
          }
        : {
            x: ship.position.x,
            y: sideBefore
          }

      this.#sendPositionStatusFor({
        coordinates,
        status: 'miss',
        playerShootId,
        socket
      })
    }

    for (let posSide = sideBefore; posSide <= sideAfter; posSide++) {
      if (this.#isCoordinateWithinPlayDesk(side, posSide)) {
        const nearPosSideName = isX ? 'y' : 'x'
        const nearPosSides = [
          ship.position[nearPosSideName] - 1,
          ship.position[nearPosSideName] + 1
        ]

        nearPosSides.forEach((nearPos) => {
          if (this.#isCoordinateWithinPlayDesk(nearPosSideName, nearPos)) {
            const coordinates = isX
              ? {
                  x: posSide,
                  y: nearPos
                }
              : {
                  x: nearPos,
                  y: posSide
                }

            this.#sendPositionStatusFor({
              coordinates,
              status: 'miss',
              playerShootId,
              socket
            })
          }
        })
      }
    }

    if (this.#isCoordinateWithinPlayDesk(side, sideAfter)) {
      const coordinates = isX
        ? {
            x: sideAfter,
            y: ship.position.y
          }
        : {
            x: ship.position.x,
            y: sideAfter
          }

      this.#sendPositionStatusFor({
        coordinates,
        status: 'miss',
        playerShootId,
        socket
      })
    }
  }

  #sendKilled({
    playerShootId,
    ship,
    sockets
  }: {
    playerShootId: PayloadSendGameAttack['currentPlayer']
    ship: Ship
    sockets: WebSocket[]
  }) {
    for (const socket of sockets) {
      const isVertical = ship.direction

      this.#sendKilledForSide({
        playerShootId,
        side: isVertical ? 'y' : 'x',
        ship,
        socket
      })
    }
  }

  /**
   * @param params
   * @param params.gameId
   * @param params.playerId
   * @param params.playerSocket
   * @param params.position
   * @throws {Error}
   */
  public async sendCommand({
    gameId,
    playerId,
    playerSocket,
    position
  }: {
    gameId: Game['id']
    playerId: Player['id']
    playerSocket: WebSocket
    position: ShipPosition
  }): Promise<void> {
    await this.#doAttack({
      gameId,
      playerId,
      playerSocket,
      position
    })
  }
}
