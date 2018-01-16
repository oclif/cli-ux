export class ExitError extends Error {
  public status: number
  public code: 'EEXIT'
  public error?: Error

  constructor(status: number, error?: Error) {
    const code = 'EEXIT'
    super(error ? error.message : `${code}: ${status}`)
    this.error = error
    this.status = status
    this.code = code
  }
}
