import {Subject} from 'rxjs/subject'
import {Subscription} from 'rxjs/subscription'
import { inspect } from 'util'

import { ActionBase, IAction } from './action/base'
import {Config} from './config'
import deps from './deps'
import { getErrorMessage, getExitCode, IErrorOptions } from './errors'
import logger from './logger'
import {Message} from './message'
import Prompt, { IPromptOptions } from './prompt'
import StreamOutput from './stream'
import { TableOptions } from './table'

const deprecate = process.env.DEBUG ? require('util').deprecate : (fn: () => {}) => () => fn()
const deprecatedColor = deprecate(
  () => require('@heroku-cli/color').default,
  "cli.color is deprecated. Please use `import color from '@heroku-cli/color'` instead.",
)

export class CLI extends Subject<Message> {
  public config: Config = deps.config
  public stdout: StreamOutput = new deps.StreamOutput('stdout')
  public stderr: StreamOutput = new deps.StreamOutput('stderr')
  public logger: Subscription

  private _prompt: Prompt
  public get Prompt() {
    if (!this._prompt) {
      this._prompt = new deps.Prompt(this.stdout, this.stderr)
    }
    return this._prompt
  }

  private __action: ActionBase
  private _action: IAction
  public get action() {
    // if (!this._action) {
    //   this.__action = deps.ActionBase.getSpinner(this.stdout, this.stderr)
    //   const subject = this
    //   this._action = {
    //     start(content: string, status?: string) { subject.next({type: 'action_start', content, status}) },
    //     stop(status: string = 'done') { subject.next({type: 'action_stop', status}) },
    //     get status() { return subject.__action.status },
    //     set status(v: string | undefined) { subject.next({type: 'action_status', status}) },
    //   }
    // }
    // return this._action
  }

  constructor () {
    super()
    this.config.on('errlog', errlog => this.updateLogger(errlog))
  }

  public prompt(name: string, options: IPromptOptions = {}) {
    return this.__action.pauseAsync(() => {
      return this.Prompt.prompt(name, options)
    }, deps.chalk.cyan('?'))
  }

  public confirm(message: string): Promise<boolean> {
    return this.__action.pauseAsync(async () => {
      const confirm = async (): Promise<boolean> => {
        let response = (await this.Prompt.prompt(message)).toLowerCase()
        if (['n', 'no'].includes(response)) return false
        if (['y', 'yes'].includes(response)) return true
        return confirm()
      }
      return confirm()
    }, deps.chalk.cyan('?'))
  }

  public log(data: string = '', ...args: any[]) {
    return deprecate(() => {
      this.info(data, ...args)
    }, 'cli.log is deprecated. Use cli.info() instead')
    // this.action.pause(() => {
    //   return this.stdout.log(data, ...args)
    // })
  }

  public info(msg: string = '', ...args: any[]) {
    this.next({type: 'line', level: 'info', content: this.content(msg, args)})
  }

  public warn(input: Error | string, options: {context?: string} = {}) {
    const error = input instanceof Error ? input : new Error(input)
    let msg = getErrorMessage(error, options)
    this.next({type: 'line', level: 'warn', content: this.content(msg), error})
    // this.action.pause(() => {
    //   return this.Errors.warn(err, options)
    // }, deps.chalk.bold.yellow('!'))
  }

  public error(input: Error | string, options: {exit: false}): void
  public error(input: Error | string, options?: Partial<IErrorOptions>): Promise<void>
  public error(input: Error | string, options: Partial<IErrorOptions> = {}) {
    const error = input instanceof Error ? input : new Error(input)
    let msg = getErrorMessage(error, options)
    this.next({type: 'line', level: 'error', content: this.content(msg), error})
    const code = getExitCode(options)
    if (code !== false) return this.exit(code)
    // this.emit('error', typeof err === 'string' ? new Error(err) : err)
    // this.action.pause(() => {
    //   return this.Errors.error(err, options)
    // }, deps.chalk.bold.red('!'))
  }

  public fatal(input: Error | string, options: Partial<IErrorOptions> = {}) {
    const error = input instanceof Error ? input : new Error(input)
    let msg = getErrorMessage(error, options)
    this.next({type: 'line', level: 'fatal', content: this.content(msg), error})
    // this.emit('error', typeof err === 'string' ? new Error(err) : err)
    // this.action.pause(() => {
    //   return this.Errors.error(err, options)
    // }, deps.chalk.bold.red('!'))
  }

  public async exit(code: number = 1) {
    await this.done()
    if (this.config.debug) {
      console.error(`Exiting with code: ${code}`)
    }
    if (this.config.mock) {
      throw new deps.ExitError(code, this.stdout.output, this.stderr.output)
    } else {
      process.exit(code)
    }
  }

  public table(data: any[], options: Partial<TableOptions>) {
    let table = require('./table')
    return table(this, data, options)
  }

  public styledJSON(obj: any) {
    let json = JSON.stringify(obj, null, 2)
    if (deps.chalk.enabled) {
      let cardinal = require('cardinal')
      let theme = require('cardinal/themes/jq')
      this.info(cardinal.highlight(json, { json: true, theme }))
    } else {
      this.info(json)
    }
  }

  public styledHeader(header: string) {
    this.info(deps.chalk.dim('=== ') + deps.chalk.bold(header))
  }

  public styledObject(obj: any, keys: string[]) {
    const util = require('util')
    let keyLengths = Object.keys(obj).map(key => key.toString().length)
    let maxKeyLength = Math.max.apply(Math, keyLengths) + 2
    function pp(obj: any) {
      if (typeof obj === 'string' || typeof obj === 'number') {
        return obj
      } else if (typeof obj === 'object') {
        return Object.keys(obj)
          .map(k => k + ': ' + util.inspect(obj[k]))
          .join(', ')
      } else {
        return util.inspect(obj)
      }
    }
    let logKeyValue = (key: string, value: any) => {
      this.info(`${deps.chalk.blue(key)}:` + ' '.repeat(maxKeyLength - key.length - 1) + pp(value))
    }
    for (let key of keys || Object.keys(obj).sort()) {
      let value = obj[key]
      if (Array.isArray(value)) {
        if (value.length > 0) {
          logKeyValue(key, value[0])
          for (let e of value.slice(1)) {
            this.info(' '.repeat(maxKeyLength) + pp(e))
          }
        }
      } else if (value !== null && value !== undefined) {
        logKeyValue(key, value)
      }
    }
  }

  public get color() {
    return deprecatedColor()
  }

  /**
   * puts in a handler for process.on('uncaughtException') and process.on('unhandledRejection')
   * and some other things
   */
  public setup() {
    if (this.config.setup) return
    this.config.setup = true
    process.once('unhandledRejection', (reason, p) => {
      this.fatal(reason, { context: 'Promise unhandledRejection' })
    })
    process.once('uncaughtException', error => {
      this.fatal(error, { context: 'Error uncaughtException' })
    })
    process.once('SIGINT', () => {
      // if (this.action.task) cli.action.stop(color.red('ctrl-c'))
      cli.exit(1)
    })
    const handleEPIPE = (err: NodeJS.ErrnoException) => {
      if (err.code !== 'EPIPE') throw err
    }
    process.stdout.on('error', handleEPIPE)
    process.stderr.on('error', handleEPIPE)
  }

  public handleUnhandled() {
    deprecate(() => this.setup(), 'this command is now .setup()')
  }

  /**
   * cleanup any outstanding output like actions that need to be stopped
   */
  public done() {
    this.complete()
    this.action.stop()
  }

  private content (data: string, args: any[] = []): string {
    return [data, ...args].map(a => inspect(a)).join(' ')
  }

  private updateLogger (errlog: string | undefined) {
    if (this.logger) this.logger.unsubscribe()
    if (!errlog) delete this.logger
    else this.logger = logger(errlog, 'warn')(this).subscribe()
  }
}

export const cli = new CLI()

export default cli
