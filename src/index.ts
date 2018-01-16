import Rx = require('rxjs/Rx')

import errors from './errors'
import {ExitError} from './exit'
import logger from './logger'
import {ErrorMessage, Message} from './message'
import output from './output'

import {config, Config} from './config'

export interface IErrorOptions {
  exit?: number | false
  severity?: 'fatal' | 'error' | 'warn'
}

export class CLI extends Rx.Subject<Message> {
  children: Rx.Observable<any>
  subscription: Rx.Subscription
  config: Config = config

  constructor(public scope?: string) {
    super()
    this.reset()
    this.config.subscribe(this)
  }

  error(input: Error | string, options: IErrorOptions = {}) {
    const error = input instanceof Error ? input : new Error(input)
    this.next({type: 'error', severity: options.severity || 'error', error} as ErrorMessage)
    const code = getExitCode(options)
    if (code !== false) this.exit(code, error)
  }

  fatal(input: Error | string, options: IErrorOptions = {}) { this.error(input, {...options, severity: 'fatal'}) }
  warn(input: Error | string) { this.error(input, {severity: 'warn', exit: false}) }

  info(...input: any[]) { this.next({type: 'output', severity: 'info', input}) }
  log(...input: any[]) { this.info(...input) }
  debug(...input: any[]) { this.next({type: 'output', severity: 'debug', input}) }
  trace(...input: any[]) { this.next({type: 'output', severity: 'trace', input}) }

  exit(code = 1, error?: Error) { throw new ExitError(code, error) }

  async done() {
    await new Promise((resolve, reject) => {
      this.children.subscribe({error: reject, complete: resolve})
      this.next({type: 'done'})
    })
    this.reset()
  }

  private reset() {
    this.children = Rx.Observable.forkJoin(
      errors(this),
      output(this),
      logger(this),
    ).share()
    this.children.subscribe()
  }
}

function getExitCode(options: IErrorOptions): false | number {
  let exit = options.exit === undefined ? (options as any).exitCode : options.exit
  if (exit === false) return false
  if (exit === undefined) return 1
  return exit
}

export default new CLI()
