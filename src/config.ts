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
  !['dumb', 'emacs-color'].includes(process.env.TERM!) &&
  'spinner'
) || 'simple'

const Action = actionType === 'spinner' ? require('./action/spinner').default : require('./action/simple').default

export class Config {
  logLevel: Levels = 'warn'
  outputLevel: Levels = 'info'
  action: ActionBase = new Action()
  errorsHandled = false
  showStackTrace = true

  get debug(): boolean { return globals.debug || process.env.DEBUG === '*' }
  set debug(v: boolean) { globals.debug = v }
  get context(): any { return globals.context || {} }
  set context(v: any) { globals.context = v }
  get errlog(): string | undefined { return globals.errlog }
  set errlog(v: string | undefined) { globals.errlog = v }
}

function fetch() {
  if (globals[version.major]) return globals[version.major]
  return globals[version.major] = new Config()
}

export const config: Config = fetch()
export default config
