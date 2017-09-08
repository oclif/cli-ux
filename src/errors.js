// @flow

import type BaseOptions from './base'

const util = require('util')
const deps = require('./deps')

const arrow = process.platform === 'win32' ? '!' : '▸'

function bangify (msg: string, c: string): string {
  let lines = msg.split('\n')
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    lines[i] = ' ' + c + line.substr(2, line.length)
  }
  return lines.join('\n')
}

function getErrorMessage (err: Error): string {
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

function wrap (msg: string): string {
  const linewrap = require('@heroku/linewrap')
  const {errtermwidth} = require('./screen')
  return linewrap(6,
    errtermwidth, {
      skipScheme: 'ansi-color',
      skip: /^\$ .*$/
    })(msg)
}

type WarnOptions = {
  prefix?: string
}

type ConstructorOptions = BaseOptions
// type ConstructorOptions = BaseOptions & {
//   errlog?: string
// }

class Errors extends deps.Base {
  options: ConstructorOptions

  constructor (options: ConstructorOptions) {
    super(options)
    this.options = options
  }

  logError (err: Error | string) {
    const errlog = this.options.errlog
    if (!errlog) return
    deps.StreamOutput.logToFile(util.inspect(err) + '\n', errlog)
  }

  warn (err: Error | string, options: WarnOptions = {}) {
    // this.action.pause(() => {
    try {
      let prefix = options.prefix ? `${options.prefix} ` : ''
      err = typeof err === 'string' ? new Error(err) : err
      this.logError(err)
      if (this.options.debug) this.stderr.write(`WARNING: ${prefix}`) && this.stderr.log(err.stack || util.inspect(err))
      else this.stderr.log(bangify(wrap(prefix + getErrorMessage(err)), deps.chalk.yellow(arrow)))
    } catch (e) {
      console.error('error displaying warning')
      console.error(e)
      console.error(err)
    }
    // }, this.color.bold.yellow('!'))
  }
}

module.exports = Errors
