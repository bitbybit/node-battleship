import { type WebSocket } from 'ws'
import { BaseCommand } from '../BaseCommand'
import {
  type Command,
  type PayloadReceiveCommand,
  type PayloadReceiveGameAttack,
  type PayloadSendGameAttack,
  type Ship
} from '../../../interfaces'
import { GameTurnCommand } from './Turn'

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

    const gameIndex = this.findGameIndexById(gameId)

    if (gameIndex === -1) {
      throw new Error(`Unable to find game with id ${gameId}`)
    }

    const game = this.store.games[gameIndex]

    const player = this.findPlayerById(playerId)

    if (player === undefined) {
      throw new Error(`Unable to find player with id ${playerId}`)
    }

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
        `Unable to find opposing player for game with id ${gameId} and player with id ${playerId}`
      )
    }

    const ships = this.findShipsByGameAndPlayer(game.id, playerOpposingId)

    let ship: Ship

    let isHit = false
    let isKilled = false

    for (const { direction, id, length, position } of ships) {
      const isVertical = direction

      const xMin = position.x
      const xMax = isVertical ? position.x : position.x + length - 1

      const yMin = position.y
      const yMax = isVertical ? position.y + length - 1 : position.y

      const isHitX = x >= xMin && x <= xMax
      const isHitY = y >= yMin && y <= yMax

      isHit = isHitX && isHitY

      const shipIndex = this.findShipIndexById(id)

      if (shipIndex === -1) {
        throw new Error(`Unable to find ship with id ${id}`)
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

    const players = [socket, this.findSocketByPlayerId(playerOpposingId)]

    const sendPositionStatusFor = ({
      x,
      y,
      status,
      playerShootId,
      socket
    }: {
      x: PayloadSendGameAttack['position']['x']
      y: PayloadSendGameAttack['position']['y']
      status: PayloadSendGameAttack['status']
      playerShootId: PayloadSendGameAttack['currentPlayer']
      socket: WebSocket
    }) => {
      const data: PayloadSendGameAttack = {
        position: {
          x,
          y
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

    const sendKilled = () => {
      for (const socket of players) {
        const isVertical = ship.direction

        if (isVertical) {
          for (
            let posY = ship.position.y;
            posY <= ship.position.y + ship.length - 1;
            posY++
          ) {
            sendPositionStatusFor({
              x: ship.position.x,
              y: posY,
              status: 'killed',
              playerShootId: playerId,
              socket
            })
          }

          const yBefore = ship.position.y - 1
          const yAfter = ship.position.y + ship.length

          if (yBefore >= 0 && yBefore <= 9) {
            sendPositionStatusFor({
              x: ship.position.x,
              y: yBefore,
              status: 'miss',
              playerShootId: playerId,
              socket
            })
          }

          for (let posY = yBefore; posY <= yAfter; posY++) {
            if (posY >= 0 && posY <= 9) {
              const sideX = [ship.position.x - 1, ship.position.x + 1]

              sideX.forEach((side) => {
                if (side >= 0 && side <= 9) {
                  sendPositionStatusFor({
                    x: side,
                    y: posY,
                    status: 'miss',
                    playerShootId: playerId,
                    socket
                  })
                }
              })
            }
          }

          if (yAfter >= 0 && yAfter <= 9) {
            sendPositionStatusFor({
              x: ship.position.x,
              y: yAfter,
              status: 'miss',
              playerShootId: playerId,
              socket
            })
          }
        } else {
          for (
            let posX = ship.position.x;
            posX <= ship.position.x + ship.length - 1;
            posX++
          ) {
            sendPositionStatusFor({
              x: posX,
              y: ship.position.y,
              status: 'killed',
              playerShootId: playerId,
              socket
            })
          }

          const xBefore = ship.position.x - 1
          const xAfter = ship.position.x + ship.length

          if (xBefore >= 0 && xBefore <= 9) {
            sendPositionStatusFor({
              x: xBefore,
              y: ship.position.y,
              status: 'miss',
              playerShootId: playerId,
              socket
            })
          }

          for (let posX = xBefore; posX <= xAfter; posX++) {
            if (posX >= 0 && posX <= 9) {
              const sideY = [ship.position.y - 1, ship.position.y + 1]

              sideY.forEach((side) => {
                if (side >= 0 && side <= 9) {
                  sendPositionStatusFor({
                    x: posX,
                    y: side,
                    status: 'miss',
                    playerShootId: playerId,
                    socket
                  })
                }
              })
            }
          }

          if (xAfter >= 0 && xAfter <= 9) {
            sendPositionStatusFor({
              x: xAfter,
              y: ship.position.y,
              status: 'miss',
              playerShootId: playerId,
              socket
            })
          }
        }
      }

      this.store.games[gameIndex].lastAttack = 'killed'
    }

    const sendHitOrMiss = () => {
      const status = isHit ? 'shot' : 'miss'

      for (const socket of players) {
        sendPositionStatusFor({
          x,
          y,
          status,
          playerShootId: playerId,
          socket
        })
      }

      this.store.games[gameIndex].lastAttack = status
    }

    if (isKilled) {
      sendKilled()
    } else {
      sendHitOrMiss()
    }

    const gameTurn = this.commandFinder.findByType(GameTurnCommand.type)

    await gameTurn.sendCommand({
      gameId
    })
  }

  /**
   * @throws {Error}
   */
  public async sendCommand(): Promise<void> {}
}
