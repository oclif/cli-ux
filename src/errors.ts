import * as util from 'util'
import { deps } from './deps'

import { Base } from './base'
import { ExitError } from './exit_error'
import { StreamOutput } from './stream'

const arrow = process.platform === 'win32' ? '!' : '▸'

function bangify(msg: string, c: string): string {
  const lines = msg.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    lines[i] = ' ' + c + line.substr(2, line.length)
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
  const { errtermwidth } = require('./screen')
  return linewrap(6, errtermwidth, {
    skip: /^\$ .*$/,
    skipScheme: 'ansi-color',
  })(msg)
}

export interface IWarnOptions {
  prefix?: string
}

export class Errors extends Base {
  public error(err: Error | string, exitCode: number | false = 1) {
    if (this.options.mock && typeof err !== 'string' && exitCode !== false) throw err
    try {
      if (typeof err === 'string') {
        err = new Error(err)
      }
      this.logError(err)
      if (this.options.debug) {
        this.stderr.log(err.stack || util.inspect(err))
      } else {
        this.stderr.log(bangify(wrap(getErrorMessage(err)), deps.chalk.red(arrow)))
      }
    } catch (e) {
      console.error('error displaying error')
      console.error(e)
      console.error(err)
    }
    if (exitCode !== false) {
      this.exit(exitCode)
    }
  }

  public warn(err: Error | string, options: IWarnOptions = {}) {
    try {
      const prefix = options.prefix ? `${options.prefix} ` : ''
      err = typeof err === 'string' ? new Error(err) : err
      this.logError(err)
      if (this.options.debug) {
        this.stderr.write(`WARNING: ${prefix}`)
        this.stderr.log(err.stack || util.inspect(err))
      } else {
        this.stderr.log(bangify(wrap(prefix + getErrorMessage(err)), deps.chalk.yellow(arrow)))
      }
    } catch (e) {
      console.error('error displaying warning')
      console.error(e)
      console.error(err)
    }
    // }, this.color.bold.yellow('!'))
  }

  public exit(code: number = 0) {
    if (this.options.debug) {
      console.error(`Exiting with code: ${code}`)
    }
    if (this.options.mock) {
      throw new ExitError(code, this.stdout.output, this.stderr.output)
    } else {
      process.exit(code)
    }
  }

  private logError(err: Error | string) {
    if (!this.options.errlog) {
      return
    }
    StreamOutput.logToFile(util.inspect(err) + '\n', this.options.errlog)
  }
}
