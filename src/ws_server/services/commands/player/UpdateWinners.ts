/**
 * Update winners (for all after every winners table update)
 */
export type PayloadSendPlayerUpdateWinners = Array<{
  name: string
  wins: number
}>

export const type = 'update_winners'
