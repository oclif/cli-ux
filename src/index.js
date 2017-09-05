// @flow

const util = require('util')
const {StreamOutput, logToFile} = require('./stream')
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

type Options = {
  errlog?: string,
  mock?: boolean,
  debug?: boolean
}

class CLIUX {
  options: Options
  _stdout: StreamOutput
  _stderr: StreamOutput

  constructor (options: Options = {}) {
    this.options = options
    let streamOptions = {
      mock: this.options.mock
    }
    this._stdout = new StreamOutput(process.stdout, streamOptions)
    this._stderr = new StreamOutput(process.stderr, streamOptions)
  }

  get stderr (): string {
    const output = this._stderr.output
    if (!output) throw new Error('not mocking stderr')
    return output
  }

  get stdout (): string {
    const output = this._stdout.output
    if (!output) throw new Error('not mocking stdout')
    return output
  }

  action (msg: string, fn: Function) {
    return require('./action')(msg, fn)
  }

  warn (err: Error | string, prefix?: string) {
    const chalk = require('chalk')
    // this.action.pause(() => {
    try {
      prefix = prefix ? `${prefix} ` : ''
      err = typeof err === 'string' ? new Error(err) : err
      this.logError(err)
      if (this.options.debug) this._stderr.write(`WARNING: ${prefix}`) && this._stderr.log(err.stack || util.inspect(err))
      else this._stderr.log(bangify(wrap(prefix + getErrorMessage(err)), chalk.yellow(arrow)))
    } catch (e) {
      console.error('error displaying warning')
      console.error(e)
      console.error(err)
    }
    // }, this.color.bold.yellow('!'))
  }

  logError (err: Error | string) {
    const errlog = this.options.errlog
    if (!errlog) return
    logToFile(util.inspect(err) + '\n', errlog)
  }

  get CLIUX (): Class<CLIUX> {
    return CLIUX
  }
}

module.exports = new CLIUX()
