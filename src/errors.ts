import * as util from 'util'

import deps from './deps'

const arrow = process.platform === 'win32' ? ' !' : ' ▸'

function bangify(msg: string, c: string): string {
  const lines = msg.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    lines[i] = c + line.substr(2, line.length)
  }
  return lines.join('\n')
}

export function getExitCode (options: Partial<IErrorOptions>): false | number {
  let exit = options.exit || (options as any).exitCode
  if (exit === false) return false
  if (exit === undefined) return 1
  return exit
}

export function getErrorMessage(err: any, {context}: Partial<IErrorOptions> = {}): string {
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
  message = message || util.inspect(err)
  return context ? `${context}: ${message}` : message
}

function wrap(msg: string): string {
  const linewrap = require('@heroku/linewrap')
  return linewrap(6, deps.screen.errtermwidth, {
    skip: /^\$ .*$/,
    skipScheme: 'ansi-color',
  })(msg)
}

export interface IErrorOptions {
  exit?: number | false
  context?: string
}

export function renderError (err: Error, severity: 'warn' | 'error' | 'fatal', options: IErrorOptions = {}) {
  const prefix = options.context ? `${options.context}: ` : ''
  if (deps.config.debug) {
    return `${severity.toUpperCase()}: ${prefix}\n${err.stack || util.inspect(err)}`
  } else {
    let bang = deps.chalk.red(arrow)
    if (severity === 'fatal') bang = deps.chalk.bgRed.bold.white(' FATAL ')
    if (severity === 'warn') bang = deps.chalk.yellow(arrow)
    return bangify(wrap(prefix + getErrorMessage(err)), bang)
  }
}

