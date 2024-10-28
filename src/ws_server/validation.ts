export const isValidPlayerName = (name: unknown): boolean => {
  return typeof name === 'string' && name.trim() !== ''
}

export const isValidPlayerPassword = (password: unknown): boolean => {
  return typeof password === 'string' && password.trim() !== ''
}
