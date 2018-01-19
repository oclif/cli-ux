export class ExitError extends Error {
  public 'cli-ux': {
    exitCode: number
  }
  public code: 'EEXIT'
  public error?: Error

  constructor(status: number, error?: Error) {
    const code = 'EEXIT'
    super(error ? error.message : `${code}: ${status}`)
    this.error = error
    this['cli-ux'] = {exitCode: status}
    this.code = code
  }
}
