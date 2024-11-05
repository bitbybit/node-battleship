import { type Store } from './interfaces'

export const store: Store = {
  playDesk: {
    xMin: 0,
    xMax: 9,
    yMin: 0,
    yMax: 9
  },
  players: [],
  playersAuthorized: [],
  rooms: [],
  games: [],
  ships: [],
  turns: []
}
