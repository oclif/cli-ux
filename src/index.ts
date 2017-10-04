import { StreamOutput } from './stream'
import { Prompt, IPromptOptions } from './prompt'
import { Errors, IErrorOptions } from './errors'
import { SpinnerAction } from './action/spinner'
import { SimpleAction } from './action/simple'
import { shouldDisplaySpinner } from './action/base'
import { Base } from './base'
import { ActionBase } from './action/base'
import { TableOptions } from './table'
import { Config } from './config'
import * as chalk from 'chalk'

export class CLI extends Base {
  public stdout: StreamOutput
  public stderr: StreamOutput

  constructor() {
    super()
    if (Config.mock) (<any>chalk).enabled = true
  }

  private _prompt: Prompt
  public get Prompt() {
    if (!this._prompt) {
      this._prompt = new Prompt()
    }
    return this._prompt
  }

  private _errors: Errors
  public get Errors() {
    if (!this._errors) {
      this._errors = new Errors()
    }
    return this._errors
  }

  private _action: ActionBase
  public get action() {
    if (!this._action) {
      this._action = shouldDisplaySpinner() ? new SpinnerAction() : new SimpleAction()
    }
    return this._action
  }

  public prompt(name: string, options: IPromptOptions = {}) {
    return this.action.pauseAsync(() => {
      return this.Prompt.prompt(name, options)
    }, chalk.cyan('?'))
  }

  public log(data?: string, ...args: any[]) {
    this.action.pause(() => {
      return this.stdout.log(data, ...args)
    })
  }

  public warn(err: Error | string, options: Partial<IErrorOptions> = {}) {
    this.action.pause(() => {
      return this.Errors.warn(err, options)
    }, chalk.bold.yellow('!'))
  }

  public error(err: Error | string, options: Partial<IErrorOptions> = {}) {
    this.action.pause(() => {
      return this.Errors.error(err, options)
    }, chalk.bold.red('!'))
  }

  public exit(code: number = 1) {
    this.Errors.exit(code)
  }

  public table(data: any[], options: Partial<TableOptions>) {
    let table = require('./table')
    return table(this, data, options)
  }

  public styledJSON(obj: any) {
    let json = JSON.stringify(obj, null, 2)
    if (chalk.enabled) {
      let cardinal = require('cardinal')
      let theme = require('cardinal/themes/jq')
      this.log(cardinal.highlight(json, { json: true, theme: theme }))
    } else {
      this.log(json)
    }
  }

  public styledHeader(header: string) {
    this.log(chalk.dim('=== ') + chalk.bold(header))
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
      this.log(`${chalk.blue(key)}:` + ' '.repeat(maxKeyLength - key.length - 1) + pp(value))
    }
    for (var key of keys || Object.keys(obj).sort()) {
      let value = obj[key]
      if (Array.isArray(value)) {
        if (value.length > 0) {
          logKeyValue(key, value[0])
          for (var e of value.slice(1)) {
            this.log(' '.repeat(maxKeyLength) + pp(e))
          }
        }
      } else if (value !== null && value !== undefined) {
        logKeyValue(key, value)
      }
    }
  }

  /**
   * puts in a handler for process.on('uncaughtException') and process.on('unhandledRejection')
   */
  public handleUnhandleds() {
    this.Errors.handleUnhandleds()
  }

  /**
   * cleanup any outstanding output like actions that need to be stopped
   */
  public done() {
    this.action.stop()
  }
}

export const cli = new CLI()
export default cli
