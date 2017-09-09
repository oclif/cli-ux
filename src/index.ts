import { ActionBase, shouldDisplaySpinner } from './action/base'
import { SpinnerAction } from './action/spinner'
import { SimpleAction } from './action/simple'
import { Errors, IWarnOptions } from './errors'
import { Prompt, IPromptOptions } from './prompt'
import { StreamOutput } from './stream'
import { deps } from './deps'
import { table, TableOptions } from './table'

export interface IOptions {
  errlog?: string
  mock?: boolean
  debug?: boolean
}

export class CLI {
  public action: ActionBase
  public stdout: StreamOutput
  public stderr: StreamOutput
  private errorsDep: Errors
  private promptDep: Prompt

  constructor(readonly options: IOptions = {}) {
    this.stdout = new StreamOutput(this.options.mock ? undefined : process.stdout)
    this.stderr = new StreamOutput(this.options.mock ? undefined : process.stderr)
    const depOpts = {
      debug: !!options.debug,
      mock: !!options.mock,
      stderr: this.stderr,
      stdout: this.stdout,
    }
    this.errorsDep = new Errors(depOpts)
    this.promptDep = new Prompt(depOpts)
    this.action = shouldDisplaySpinner(depOpts) ? new SpinnerAction(depOpts) : new SimpleAction(depOpts)
    if (this.options.mock || !process.stderr.isTTY || !process.stdout.isTTY) deps.chalk.enabled = false
  }

  public prompt(name: string, options: IPromptOptions = {}) {
    return this.action.pauseAsync(() => {
      return this.promptDep.prompt(name, options)
    }, deps.chalk.cyan('?'))
  }

  public log(data: string, ...args: any[]) {
    this.action.pause(() => {
      return this.stdout.log(data, ...args)
    })
  }

  public warn(err: Error | string, options: IWarnOptions = {}) {
    this.action.pause(() => {
      return this.errorsDep.warn(err, options)
    }, deps.chalk.bold.yellow('!'))
  }

  public error(err: Error | string, exitCode: number | false = 1) {
    this.action.pause(() => {
      return this.errorsDep.error(err, exitCode)
    }, deps.chalk.bold.red('!'))
  }

  public exit(code: number = 1) {
    this.errorsDep.exit(code)
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

  public done() {
    this.action.stop()
  }
}

export const cli = new CLI()
