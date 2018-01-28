import * as semver from 'semver'

import {ActionBase} from './action/base'

const version = semver.parse(require('../package.json').version)!

export type Levels = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

export interface ConfigMessage {
  type: 'config'
  prop: string
  value: any
}

const globals = global['cli-ux'] || (global['cli-ux'] = {})

const actionType = (
  !!process.stdin.isTTY &&
  !!process.stderr.isTTY &&
  !process.env.CI &&
  process.env.TERM !== 'dumb' &&
  'spinner'
) || 'simple'

const Action = actionType === 'spinner' ? require('./action/spinner').default : require('./action/simple').default

export class Config {
  logLevel: Levels = 'warn'
  outputLevel: Levels = 'info'
  _debug = false
  action: ActionBase = new Action()
  errorsHandled = false
  context: any = {}
  errlog?: string

  constructor() {
    this.debug = process.env.DEBUG === '*'
  }

  get debug(): boolean {
    return this._debug
  }
  set debug(v: boolean) {
    this._debug = v
    if (this._debug && this.outputLevel !== 'trace') this.outputLevel = 'debug'
  }
}

function fetch() {
  if (globals[version.major]) return globals[version.major]
  return globals[version.major] = new Config()
}

export const config: Config = fetch()
export default config
