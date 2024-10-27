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
  index: number | string
  name: string
}

export const type = 'reg'
