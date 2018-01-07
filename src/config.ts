import * as EventEmitter from 'events'

import deps from './deps'

export class Config extends EventEmitter {
  public get debug(): boolean {
    return !!this._globals.debug
  }
  public set debug(debug: boolean) {
    this._globals.debug = debug
  }

  public get mock(): boolean {
    return !!this._globals.mock
  }
  public set mock(mock: boolean) {
    if (mock) {
      deps.chalk.enabled = false
      this.stdout = ''
      this.stderr = ''
    }
    this._globals.mock = mock
  }

  public get errlog(): string | undefined {
    return this._globals.errlog
  }
  public set errlog(errlog: string | undefined) {
    this.emit('errlog', errlog)
    this._globals.errlog = errlog
  }

  public get stdout(): string {
    return this._globals.stdout || ''
  }
  public set stdout(stdout: string) {
    this._globals.stdout = stdout
  }

  public get stderr(): string {
    return this._globals.stderr || ''
  }
  public set stderr(stderr: string) {
    this._globals.stderr = stderr
  }

  public get windows(): boolean {
    return process.platform === 'win32'
  }

  public get action(): 'spinner' | 'simple' | 'debug' {
    return (this.debug && 'debug') || (
      !deps.config.mock &&
      !!process.stdin.isTTY &&
      !!process.stderr.isTTY &&
      !process.env.CI &&
      process.env.TERM !== 'dumb' &&
      'spinner'
    ) || 'simple'
  }

  private get _globals() {
    const globals = global['cli-ux'] = global['cli-ux'] || {}
    globals.action = globals.action || {}
    return globals
  }
}

export default new Config()
