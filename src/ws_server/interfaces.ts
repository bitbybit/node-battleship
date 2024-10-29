import { type WebSocket, type WebSocketServer } from 'ws'

declare module 'ws' {
  interface WebSocket {
    id: string
    isAlive?: boolean
  }

  interface WebSocketServer {
    clients: Set<WebSocket>
  }
}

export type PlayerId = string

export type Player = {
  id: PlayerId
  name: string
  password: string
}

export type PlayerAuthorized = {
  playerId: PlayerId
  socketId: WebSocket['id']
}

export type GameId = string

export type Game = {
  id: GameId
  player1Id: PlayerId
  player2Id: PlayerId
}

export type ShipPosition = {
  x: number
  y: number
}

export type ShipType = 'small' | 'medium' | 'large' | 'huge'

export type AttackStatus = 'miss' | 'killed' | 'shot'

export type RoomId = string

export type Room = {
  id: RoomId
  player1Id: PlayerId
  player2Id: PlayerId | null
}

/**
 * Login or create player
 */
export type PayloadReceivePlayerLogin = {
  name: string
  password: string
}

export type PayloadSendPlayerLogin = {
  error: boolean
  errorText: string
  index: PlayerId
  name: string
}

/**
 * Update winners (for all after every winners table update)
 */
export type PayloadSendPlayerUpdateWinners = Array<{
  name: string
  wins: number
}>

/**
 * Create new room (create game room and add yourself there)
 */
export type PayloadReceiveRoomCreate = string

/**
 * Add user to room (add yourself to somebody's room,
 * then remove the room from available rooms list)
 */
export type PayloadReceiveRoomAddUser = {
  indexRoom: RoomId
}

/**
 * Send for both players in the room, after they are connected to the room
 */
export type PayloadSendRoomCreateGame = {
  idGame: GameId
  idPlayer: PlayerId
}

/**
 * Update room state (send rooms list, where only one player inside)
 */
export type PayloadSendRoomUpdate = Array<{
  roomId: RoomId
  roomUsers: Array<{
    name: string
    index: PlayerId
  }>
}>

/**
 * Add ships to the game board
 */
export type PayloadReceiveShipAdd = {
  gameId: number | string
  ships: Array<{
    position: ShipPosition
    direction: boolean
    length: number
    type: ShipType
  }>
  indexPlayer: PlayerId
}

/**
 * Start game (only after server receives both player's ships positions)
 */
export type PayloadSendShipStartGame = {
  // Player's ships, not enemy's
  ships: Array<{
    position: ShipPosition
    direction: boolean
    length: number
    type: ShipType
  }>
  currentPlayerIndex: PlayerId
}

export type PayloadReceiveGameAttackRandom = {
  gameId: GameId
  indexPlayer: PlayerId
}

export type PayloadReceiveGameAttack = {
  gameId: GameId
  x: number
  y: number
  indexPlayer: PlayerId
}

/**
 * Should be sent after every shot,
 * miss and after kill sent miss for all cells around ship too
 */
export type PayloadSendGameAttack = {
  position: ShipPosition
  currentPlayer: PlayerId
  status: AttackStatus
}

/**
 * Info about player's turn
 * (send after game start and every attack, miss or kill result)
 */
export type PayloadSendGameTurn = {
  currentPlayer: PlayerId
}

export type PayloadSendGameFinish = {
  winPlayer: PlayerId
}

export type PayloadReceiveCommand = {
  type: string
  data:
    | PayloadReceivePlayerLogin
    | PayloadReceiveRoomCreate
    | PayloadReceiveRoomAddUser
    | PayloadReceiveShipAdd
    | PayloadReceiveGameAttack
    | PayloadReceiveGameAttackRandom
  id: 0
}

export type PayloadSendCommand = {
  type: string
  data:
    | PayloadSendPlayerLogin
    | PayloadSendPlayerUpdateWinners
    | PayloadSendRoomCreateGame
    | PayloadSendRoomUpdate
    | PayloadSendShipStartGame
    | PayloadSendGameAttack
    | PayloadSendGameTurn
    | PayloadSendGameFinish
  id: 0
}

export type Store = {
  players: Player[]
  playersAuthorized: PlayerAuthorized[]
  rooms: Room[]
  games: Game[]
}

export type AppParams = {
  server: WebSocketServer
  store: Store
}

export type BaseCommandParams = {
  server: WebSocketServer
  store: Store
}

export interface Command {
  onReceive(params: {
    message: PayloadReceiveCommand
    socket: WebSocket
  }): Promise<unknown>
}

export interface CommandWithType {
  type: string
}

export type CommandClass = {
  new (params: BaseCommandParams): Command
} & CommandWithType
