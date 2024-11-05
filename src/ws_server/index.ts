import { WebSocketServer } from 'ws'
import { App } from './services/App'
import { store } from './store'

export const wsServer = (port: number): void => {
  const server = new WebSocketServer({
    port
  }) as WebSocketServer

  new App({
    server,
    store
  })

  console.log(`Start WebSocket server on the ${port} port!`)
}
