import { randomUUID } from 'node:crypto'
import { type RawData, WebSocket, type WebSocketServer } from 'ws'
import { type AppParams, type PayloadReceiveCommand } from '../interfaces'
import { CommandFinder } from './CommandFinder'

export class App {
  readonly #server: WebSocketServer
  readonly #commandFinder: CommandFinder

  readonly #pingTimeout: number = 30000
  #pingInterval?: NodeJS.Timeout

  constructor(params: AppParams) {
    this.#server = params.server

    this.#commandFinder = new CommandFinder({
      server: params.server,
      store: params.store
    })

    this.#init()
  }

  #init(): void {
    this.#server.on('connection', this.#handleConnection.bind(this))
    this.#server.on('close', this.#handleClose.bind(this))

    process.on('SIGINT', this.#handleExit.bind(this))
    process.on('SIGTERM', this.#handleExit.bind(this))

    this.#setPingInterval()
  }

  #handleConnection(socket: WebSocket): void {
    socket.id = randomUUID()

    socket.on('message', (rawData) =>
      this.#handleMessage({
        rawData,
        socket
      })
    )

    socket.on('error', this.#handleError.bind(this))

    this.#setPongHandler(socket)
  }

  async #handleMessage({
    rawData,
    socket
  }: {
    rawData: RawData
    socket: WebSocket
  }): Promise<void> {
    try {
      const message = this.#parseMessage(rawData)
      const command = this.#commandFinder.findByMessage(message)

      await command.onReceive({
        message,
        socket
      })
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

  #handleExit(): void {
    this.#server.clients.forEach((socket) => {
      socket.close(1001, 'Shutting down WS server...')

      process.nextTick(() => {
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CLOSING
        ) {
          socket.terminate()
        }
      })
    })

    this.#server.close(() => {
      console.log('WS server shut down.')

      process.exit(0)
    })
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

  #parseMessage(rawData: RawData): PayloadReceiveCommand {
    const parsed = JSON.parse(rawData.toString())

    parsed.data = parsed.data === '' ? '' : JSON.parse(parsed.data)

    return parsed as PayloadReceiveCommand
  }
}
