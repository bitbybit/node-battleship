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
  lastAttack: AttackStatus | null
}

export type ShipId = string

export type ShipPosition = {
  x: number
  y: number
}

export type ShipType = 'small' | 'medium' | 'large' | 'huge'

export type Ship = {
  direction: boolean
  gameId: GameId
  id: ShipId
  length: number
  life: number
  playerId: PlayerId
  position: ShipPosition
  type: ShipType
}

export type AttackStatus = 'miss' | 'killed' | 'shot'

export type RoomId = string

export type Room = {
  id: RoomId
  player1Id: PlayerId
  player2Id: PlayerId | null
}

export type TurnId = string

export type Turn = {
  id: TurnId
  gameId: GameId
  playerId: PlayerId
}

/**
 * Login or create player
 */
export type PayloadReceivePlayerLogin = {
  name: Player['name']
  password: string
}

export type PayloadSendPlayerLogin = {
  error: boolean
  errorText: string
  index: PlayerId
  name: Player['name']
}

/**
 * Update winners (for all after every winners table update)
 */
export type PayloadSendPlayerUpdateWinners = Array<{
  name: Player['name']
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
    name: Player['name']
    index: PlayerId
  }>
}>

/**
 * Add ships to the game board
 */
export type PayloadReceiveShipAdd = {
  gameId: GameId
  ships: Array<{
    position: ShipPosition
    direction: Ship['direction']
    length: Ship['length']
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
  ships: Ship[]
  turns: Turn[]
}

export interface AbstractCommandFinder {
  findByMessage(message: PayloadReceiveCommand): Command
  findByType(type: string): Command
}

export type AppParams = {
  server: WebSocketServer
  store: Store
}

export type BaseCommandParams = {
  commandFinder: AbstractCommandFinder
  server: WebSocketServer
  store: Store
}

export type CommandFinderParams = {
  server: WebSocketServer
  store: Store
}

export interface Command {
  onReceive(params: {
    message: PayloadReceiveCommand
    socket: WebSocket
  }): Promise<unknown>

  sendCommand(payload?: unknown): Promise<unknown>
}

export interface CommandWithType {
  type: string
}

export type CommandClass = {
  new (params: BaseCommandParams): Command
} & CommandWithType
