import Rx = require('rxjs/Rx')
import * as semver from 'semver'

import {ActionBase} from './action/base'
import {ConfigMessage} from './message'

const version = semver.parse(require('../package.json').version)!

export type Levels = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

const globals = global['cli-ux'] || (global['cli-ux'] = {})

const actionType = (
  !!process.stdin.isTTY &&
  !!process.stderr.isTTY &&
  !process.env.CI &&
  process.env.TERM !== 'dumb' &&
  'spinner'
) || 'simple'

const Action = actionType === 'spinner' ? require('./action/spinner').default : require('./action/simple').default

export class Config extends Rx.Subject<ConfigMessage> {
  logLevel: Levels = 'warn'
  outputLevel: Levels = 'info'
  debug = process.env.DEBUG === '*'
  action: ActionBase = new Action()
  errorsHandled = false

  get errlog(): string | undefined { return globals.errlog }
  set errlog(errlog: string | undefined) {
    globals.errlog = errlog
    this.next({type: 'config', prop: 'errlog', value: errlog})
  }
}

function current() {
  if (!globals[version.major] || globals[version.major].closed) return
  return globals[version.major]
}

function fetch() {
  let subject = current()
  if (subject) return subject
  return globals[version.major] = new Config()
}

export const config: Config = fetch()
