// @flow

import * as chalk from 'chalk'
import * as util from 'util'

import Base from './base'
import StreamOutput from './stream'

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

interface IWarnOptions {
  prefix?: string
}

export default class Errors extends Base {
  public warn(err: Error | string, options: IWarnOptions = {}) {
    // this.action.pause(() => {
    try {
      const prefix = options.prefix ? `${options.prefix} ` : ''
      err = typeof err === 'string' ? new Error(err) : err
      this.logError(err)
      if (this.options.debug) {
        this.stderr.write(`WARNING: ${prefix}`)
        this.stderr.log(err.stack || util.inspect(err))
      } else {
        this.stderr.log(bangify(wrap(prefix + getErrorMessage(err)), chalk.yellow(arrow)))
      }
    } catch (e) {
      console.error('error displaying warning') // tslint:disable-line:no-console
      console.error(e) // tslint:disable-line:no-console
      console.error(err) // tslint:disable-line:no-console
    }
    // }, this.color.bold.yellow('!'))
  }

  private logError(err: Error | string) {
    if (!this.options.errlog) {
      return
    }
    StreamOutput.logToFile(util.inspect(err) + '\n', this.options.errlog)
  }
}
