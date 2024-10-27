import { config as setEnvVariables } from 'dotenv'
import { PORT_HTTP, PORT_WS } from '../const/defaults'

/**
 * Get `values from ENV (`.env` file)
 * @returns number
 */
export const getPorts = (): Record<string, number> => {
  setEnvVariables()

  return {
    http: Number(process.env.PORT_HTTP ?? PORT_HTTP),
    ws: Number(process.env.PORT_WS ?? PORT_WS)
  }
}
