import Rx = require('rxjs/Rx')

import errors from './errors'
import {ExitError} from './exit'
import logger from './logger'
import {Message} from './message'
import output from './output'

import {config, Config} from './config'

const buildError = (i: string | Error) => i instanceof Error ? i : new Error(i)

export interface IErrorOptions {
  exit?: number | false
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

  fatal(input: Error | string, options: IErrorOptions = {}) {
    const error = buildError(input)
    this.next({type: 'error', severity: 'fatal', error})
    const code = getExitCode(options)
    if (code !== false) this.exit(code, error)
  }

  error(input: Error | string, options: IErrorOptions = {}) {
    const error = buildError(input)
    this.next({type: 'error', severity: 'error', error})
    const code = getExitCode(options)
    if (code !== false) this.exit(code, error)
  }

  warn(input: Error | string) {
    const error = buildError(input)
    this.next({type: 'error', severity: 'warn', error})
  }

  info(...input: any[]) {
    this.next({type: 'output', severity: 'info', input})
  }

  debug(...input: any[]) {
    this.next({type: 'output', severity: 'debug', input})
  }

  trace(...input: any[]) {
    this.next({type: 'output', severity: 'trace', input})
  }

  exit(code = 1, error?: Error) {
    throw new ExitError(code, error)
  }

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
