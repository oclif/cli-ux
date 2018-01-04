import deps from './deps'

export default class Config {
  public static get debug(): boolean {
    return !!Config._globals.debug
  }
  public static set debug(debug: boolean) {
    Config._globals.debug = debug
  }

  public static get mock(): boolean {
    return !!Config._globals.mock
  }
  public static set mock(mock: boolean) {
    if (mock) {
      deps.chalk.enabled = false
      Config.stdout = ''
      Config.stderr = ''
    }
    Config._globals.mock = mock
  }

  public static get displayTimestamps(): boolean {
    return !!Config._globals.displayTimestamps
  }
  public static set displayTimestamps(displayTimestamps: boolean) {
    Config._globals.displayTimestamps = displayTimestamps
  }

  public static get errlog(): string | undefined {
    return Config._globals.errlog
  }
  public static set errlog(errlog: string | undefined) {
    Config._globals.errlog = errlog
  }

  public static get stdout(): string {
    return Config._globals.stdout || ''
  }
  public static set stdout(stdout: string) {
    Config._globals.stdout = stdout
  }

  public static get stderr(): string {
    return Config._globals.stderr || ''
  }
  public static set stderr(stderr: string) {
    Config._globals.stderr = stderr
  }

  public static get windows(): boolean {
    return process.platform === 'win32'
  }

  public static get _globals(): any {
    const globals = ((global as any)['cli-ux'] = (global as any)['cli-ux'] || {})
    globals.action = globals.action || {}
    return globals
  }
}
