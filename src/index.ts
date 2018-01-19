// tslint:disable no-console
// tslint:disable restrict-plus-operands

import Rx = require('rxjs/Rx')

import {ActionBase} from './action/base'
import deps from './deps'
import errors from './errors'
import {ExitError} from './exit'
import logger from './logger'
import {ErrorMessage, Message} from './message'
import output from './output'
import {IPromptOptions} from './prompt'

import {config, Config} from './config'

export interface IErrorOptions {
  exit?: number | false
  severity?: 'fatal' | 'error' | 'warn'
}

let subject: Rx.Subject<Message> = new Rx.Subject()
let children: Rx.Observable<any>

config.subscribe(subject)

export class CLI {
  config: Config = config

  get action(): ActionBase { return config.action }

  constructor(public scope?: string) {}

  error(input: Error | string, options: IErrorOptions = {}) {
    const error = input instanceof Error ? input : new Error(input)
    subject.next({type: 'error', scope: this.scope, severity: options.severity || 'error', error} as ErrorMessage)
    const code = getExitCode(options)
    if (code === false) return
    let exitErr: ExitError = error as any
    exitErr['cli-ux'] = exitErr['cli-ux'] || {exitCode: code}
    throw exitErr
  }

  fatal(input: Error | string, options: IErrorOptions = {}) { this.error(input, {...options, severity: 'fatal'}) }
  warn(input: Error | string) { this.error(input, {severity: 'warn', exit: false}) }

  log(...input: any[]) { this.info(...input) }
  info(...input: any[]) { subject.next({type: 'output', scope: this.scope, severity: 'info', input}) }
  debug(...input: any[]) { subject.next({type: 'output', scope: this.scope, severity: 'debug', input}) }
  trace(...input: any[]) { subject.next({type: 'output', scope: this.scope, severity: 'trace', input}) }

  exit(code = 1, error?: Error) { throw new ExitError(code, error) }

  async done() {
    config.action.stop()
    await new Promise((resolve, reject) => {
      children.subscribe({error: reject, complete: resolve})
      subject.next({type: 'done'})
    })
    reset()
  }

  styledObject(...args: any[]) { require('./styled/object').default(...args) }
  table(...args: any[]) { (require('./styled/table'))(...args) }
  styledJSON(obj: any) {
    let json = JSON.stringify(obj, null, 2)
    if (!deps.chalk.enabled) {
      this.log(json)
      return
    }
    let cardinal = require('cardinal')
    let theme = require('cardinal/themes/jq')
    this.log(cardinal.highlight(json, {json: true, theme}))
  }

  styledHeader(header: string) {
    this.log(deps.chalk.dim('=== ') + deps.chalk.bold(header))
  }

  prompt(name: string, options: IPromptOptions = {}) {
    return this.action.pauseAsync(() => {
      return deps.prompt.prompt(name, options)
    }, deps.chalk.cyan('?'))
  }

  confirm(message: string): Promise<boolean> {
    return this.action.pauseAsync(async () => {
      const confirm = async (): Promise<boolean> => {
        let response = (await deps.prompt.prompt(message)).toLowerCase()
        if (['n', 'no'].includes(response)) return false
        if (['y', 'yes'].includes(response)) return true
        return confirm()
      }
      return confirm()
    }, deps.chalk.cyan('?'))
  }
}

function getExitCode(options: IErrorOptions): false | number {
  let exit = options.exit === undefined ? (options as any).exitCode : options.exit
  if (exit === false) return false
  if (exit === undefined) return 1
  return exit
}

function reset() {
  children = Rx.Observable.forkJoin(
    errors(subject),
    output(subject),
    logger(subject),
  ).share()
  children.subscribe()
}
reset()

export const cli = new CLI()
export default cli
export {
  ExitError
}

process.once('exit', async () => {
  try {
    await cli.done()
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  }
})
