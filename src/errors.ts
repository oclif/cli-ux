import * as util from 'util'
import * as chalk from 'chalk'

import { Base } from './base'
import { ExitError } from './exit_error'
import { StreamOutput } from './stream'
import screen from './screen'
import { Config } from './config'

const arrow = process.platform === 'win32' ? ' !' : ' ▸'

function bangify(msg: string, c: string): string {
  const lines = msg.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    lines[i] = c + line.substr(2, line.length)
  }
  return lines.join('\n')
}

function getErrorMessage(err: any): string {
  let message
  if (err.body) {
    // API error
    if (err.body.message) {
      message = util.inspect(err.body.message)
    } else if (err.body.error) {
      message = util.inspect(err.body.error)
    }
  }
  // Unhandled error
  if (err.message && err.code) {
    message = `${util.inspect(err.code)}: ${err.message}`
  } else if (err.message) {
    message = err.message
  }
  return message || util.inspect(err)
}

function wrap(msg: string): string {
  const linewrap = require('@heroku/linewrap')
  return linewrap(6, screen.errtermwidth, {
    skip: /^\$ .*$/,
    skipScheme: 'ansi-color',
  })(msg)
}

export interface IErrorOptions {
  exitCode?: number | false
  severity: 'warn' | 'fatal' | 'error'
  context?: string
}

export class Errors extends Base {
  public handleUnhandleds() {
    process.on('unhandledRejection', (reason, p) => {
      this.fatal(reason, { context: 'Promise unhandledRejection' })
    })
    process.on('uncaughtException', error => {
      this.fatal(error, { context: 'Error uncaughtException' })
    })
  }

  public error(err: Error | string, options: Partial<IErrorOptions> & { exitCode: false }): void
  public error(err: Error | string, options?: Partial<IErrorOptions>): never
  public error(err: Error | string, options?: any): any {
    if (typeof options === 'string') options = { context: options }
    options = options || {}
    if (!options.severity) options.severity = 'error'
    if (options.exitCode === undefined) options.exitCode = 1
    if (options.severity !== 'warn' && Config.mock && typeof err !== 'string' && options.exitCode !== false) throw err
    try {
      if (typeof err === 'string') err = new Error(err)
      const prefix = options.context ? `${options.context}: ` : ''
      this.logError(err)
      if (Config.debug) {
        this.stderr.write(`${options.severity.toUpperCase()}: ${prefix}`)
        this.stderr.log(err.stack || util.inspect(err))
      } else {
        let bang = chalk.red(arrow)
        if (options.severity === 'fatal') bang = chalk.bgRed.bold.white(' FATAL ')
        if (options.severity === 'warn') bang = chalk.yellow(arrow)
        this.stderr.log(bangify(wrap(prefix + getErrorMessage(err)), bang))
      }
    } catch (e) {
      console.error('error displaying error')
      console.error(e)
      console.error(err)
    }
    if (options.exitCode !== false) this.exit(options.exitCode)
  }

  public fatal(err: Error | string, options: Partial<IErrorOptions> = {}) {
    options.severity = 'fatal'
    this.error(err, options)
  }

  public warn(err: Error | string, options: Partial<IErrorOptions> = {}) {
    if (typeof options === 'string') options = { context: options }
    options.exitCode = false
    options.severity = 'warn'
    this.error(err, options)
  }

  public exit(code: number = 0) {
    if (Config.debug) {
      console.error(`Exiting with code: ${code}`)
    }
    if (Config.mock) {
      throw new ExitError(code, this.stdout.output, this.stderr.output)
    } else {
      process.exit(code)
    }
  }

  private logError(err: Error | string) {
    if (!Config.errlog) return
    StreamOutput.logToFile(util.inspect(err) + '\n', Config.errlog)
  }
}
