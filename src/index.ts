import { deps } from './deps'
import { StreamOutput } from './stream'
import { Prompt, IPromptOptions } from './prompt'
import { Errors, IErrorOptions } from './errors'
import { ActionBase } from './action/base'
import { TableOptions } from './table'

const debug = require('debug')('cli-ux')

export interface IOptions {
  errlog?: string
  mock?: boolean
  debug?: boolean
  action?: ActionBase
}

export class CLI {
  public stdout: StreamOutput
  public stderr: StreamOutput

  constructor(readonly options: IOptions = {}) {
    const globalOptions = (<any>global)['cli-ux'] || {}
    if (options.mock === undefined) options.mock = globalOptions.mock
    if (options.debug === undefined) options.debug = globalOptions.debug
    this.stdout = new deps.StreamOutput(options.mock ? undefined : process.stdout)
    this.stderr = new deps.StreamOutput(options.mock ? undefined : process.stderr)
    if (options.mock) deps.chalk.enabled = false
  }

  private _prompt: Prompt
  public get Prompt() {
    if (!this._prompt) {
      this._prompt = new deps.Prompt(this._depOpts)
    }
    return this._prompt
  }

  private _errors: Errors
  public get Errors() {
    if (!this._errors) {
      this._errors = new deps.Errors(this._depOpts)
    }
    return this._errors
  }

  private _action: ActionBase
  public get action() {
    if (!this._action) {
      this._action = deps.shouldDisplaySpinner(this._depOpts)
        ? new deps.SpinnerAction(this._depOpts)
        : new deps.SimpleAction(this._depOpts)
    }
    return this._action
  }

  public prompt(name: string, options: IPromptOptions = {}) {
    return this.action.pauseAsync(() => {
      return this.Prompt.prompt(name, options)
    }, deps.chalk.cyan('?'))
  }

  public log(data?: string, ...args: any[]) {
    this.action.pause(() => {
      return this.stdout.log(data, ...args)
    })
  }

  public warn(err: Error | string, options: Partial<IErrorOptions> = {}) {
    this.action.pause(() => {
      return this.Errors.warn(err, options)
    }, deps.chalk.bold.yellow('!'))
  }

  public error(err: Error | string, options: Partial<IErrorOptions> = {}) {
    this.action.pause(() => {
      return this.Errors.error(err, options)
    }, deps.chalk.bold.red('!'))
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
    if (deps.chalk.enabled) {
      let cardinal = require('cardinal')
      let theme = require('cardinal/themes/jq')
      this.log(cardinal.highlight(json, { json: true, theme: theme }))
    } else {
      this.log(json)
    }
  }

  public styledHeader(header: string) {
    this.log(deps.chalk.dim('=== ') + deps.chalk.bold(header))
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
      this.log(`${deps.chalk.blue(key)}:` + ' '.repeat(maxKeyLength - key.length - 1) + pp(value))
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

  private get _depOpts() {
    return {
      debug: this.options.debug || (this.options.debug === undefined && debug.enabled),
      mock: !!this.options.mock,
      stderr: this.stderr,
      stdout: this.stdout,
    }
  }
}

export const cli = new CLI()
export default cli
