import { randomUUID } from 'node:crypto'
import { type RawData, type WebSocket, type WebSocketServer } from 'ws'
import {
  type AppParams,
  type Command,
  type CommandClass,
  type PayloadReceiveCommand,
  type Store
} from '../interfaces'
import { CommandFinder } from './commands/CommandFinder'
import { BaseCommand } from './commands/BaseCommand'

export class App {
  readonly #server: WebSocketServer
  readonly #store: Store

  readonly #commandFinder: CommandFinder
  readonly #commandInstances = new Map<string, Command>()

  #pingInterval?: NodeJS.Timeout
  #pingTimeout: number = 30000

  constructor(params: AppParams) {
    this.#server = params.server
    this.#store = params.store

    this.#commandFinder = new CommandFinder()

    this.#init()
  }

  #init(): void {
    this.#server.on('connection', this.#handleConnection.bind(this))
    this.#server.on('close', this.#handleClose.bind(this))

    this.#setPingInterval()
  }

  #handleConnection(socket: WebSocket): void {
    socket.id = randomUUID()

    socket.on('message', this.#handleMessage.bind(this))
    socket.on('error', this.#handleError.bind(this))

    this.#setPongHandler(socket)
  }

  async #handleMessage(rawData: RawData): Promise<void> {
    try {
      const message = JSON.parse(rawData.toString()) as PayloadReceiveCommand
      const commandClass = this.#commandFinder.find(message)
      const commandInstance = this.#getInstanceOfCommand(commandClass)

      await commandInstance.onReceive(message)
    } catch (error) {
      this.#handleError(error)
    }
  }

  #handleError(error: unknown): void {
    console.error(error)
  }

  #handleClose(): void {
    clearInterval(this.#pingInterval)
  }

  #setPingInterval(): void {
    this.#pingInterval = setInterval(() => {
      this.#server.clients.forEach((socket) => {
        if (socket.isAlive === false) {
          socket.terminate()

          console.log('Socket is terminated due to connection lost')
        } else {
          socket.isAlive = false
          socket.ping()
        }
      })
    }, this.#pingTimeout)
  }

  #setPongHandler(socket: WebSocket): void {
    try {
      socket.isAlive = true

      socket.on('pong', function () {
        socket.isAlive = true
      })
    } catch (error) {
      this.#handleError(error)
    }
  }

  #getInstanceOfCommand(commandClass: CommandClass): Command {
    const hasInstance = this.#commandInstances.has(commandClass.name)

    if (hasInstance) {
      const instance = this.#commandInstances.get(commandClass.name)
      const isCommand = instance instanceof BaseCommand

      if (!isCommand) {
        throw new Error(`${commandClass.name} is not a Command class instance`)
      }

      return instance
    }

    const instance = new commandClass({
      server: this.#server,
      store: this.#store
    })

    this.#commandInstances.set(commandClass.name, instance)

    return instance
  }
}
