// tslint:disable no-console

import chalk from 'chalk'
import {inspect} from 'util'

import CLI from '.'
import {config} from './config'
import deps from './deps'
import {IEventEmitter} from './events'

export interface Message {
  type: 'error'
  scope: string | undefined
  severity: 'fatal' | 'error' | 'warn'
  error: CLIError
}

export interface Options {
  exit?: number | false
}

const arrow = process.platform === 'win32' ? ' !' : ' ▸'

function bangify(msg: string, c: string): string {
  const lines = msg.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    lines[i] = c + line.substr(2, line.length)
  }
  return lines.join('\n')
}

export function getErrorMessage(err: any): string {
  let message
  if (err.body) {
    // API error
    if (err.body.message) {
      message = inspect(err.body.message)
    } else if (err.body.error) {
      message = inspect(err.body.error)
    }
  }
  // Unhandled error
  if (err.message && err.code) {
    message = `${inspect(err.code)}: ${err.message}`
  } else if (err.message) {
    message = err.message
  }
  return message || inspect(err)
}

function displayError(err: CLIError) {
  function wrap(msg: string): string {
    const linewrap = require('@heroku/linewrap')
    return linewrap(6, deps.screen.errtermwidth, {
      skip: /^\$ .*$/,
      skipScheme: 'ansi-color',
    })(msg)
  }

  function render(): string {
    const {severity, scope} = err['cli-ux']
    if (severity === 'fatal' || config.debug) {
      // show stack trace
      let msg = ''
      if (severity !== 'error') msg += `${severity}: `
      if (scope) msg += `${scope}: `
      msg += err.stack || inspect(err)
      return msg
    }
    let bang = chalk.red(arrow)
    let msg = scope ? `${scope}: ${getErrorMessage(err)}` : getErrorMessage(err)
    if (severity as any === 'fatal') bang = chalk.bgRed.bold.white(' FATAL ')
    if (severity === 'warn') bang = chalk.yellow(arrow)
    return bangify(wrap(msg), bang)
  }

  function getBang(): string {
    if (err['cli-ux'].severity === 'warn') return chalk.yellowBright('!')
    if (err['cli-ux'].severity === 'fatal') return chalk.bold.bgRedBright('!!!')
    return chalk.bold.redBright('!')
  }

  config.action.pause(() => {
    console.error(render())
  }, getBang())
}

export class CLIError extends Error {
  code: string
  'cli-ux': {
    severity: 'fatal' | 'error' | 'warn'
    scope: string | undefined
    exit: number | false
  }

  constructor(input: any, severity: 'fatal' | 'error' | 'warn', scope: string | undefined, opts: Options) {
    function getExitCode(options: Options): false | number {
      let exit = options.exit === undefined ? (options as any).exitCode : options.exit
      if (exit === false) return false
      if (exit === undefined) return 1
      return exit
    }

    const err: CLIError = typeof input === 'string' ? super(input) && this : input
    err['cli-ux'] = err['cli-ux'] || {
      severity,
      scope,
      exit: severity === 'warn' ? false : getExitCode(opts),
    }
    return err
  }
}

export default (e: IEventEmitter) => {
  e.on('output', m => {
    if (m.type !== 'error') return
    try {
      if (m.error['cli-ux'].exit === false) displayError(m.error)
    } catch (newErr) {
      console.error(newErr)
      console.error(m.error)
      process.exit(1)
    }
  })

  function handleUnhandleds() {
    if (config.errorsHandled) return
    const handleError = (scope: string) => async (err: CLIError) => {
      // ignore EPIPE errors
      // these come from using | head and | tail
      // and can be ignored
      try {
        const cli: typeof CLI = require('.').cli.scope(scope)
        if (err.code === 'EPIPE') return
        if (err['cli-ux'] && typeof err['cli-ux'].exit === 'number') {
          displayError(err)
          await cli.done().catch(cli.debug)
          process.exit(err['cli-ux'].exit as number)
        } else {
          cli.fatal(err)
        }
      } catch (newError) {
        console.error(err)
        console.error(newError)
        process.exit(101)
      }
    }
    config.errorsHandled = true
    process.once('SIGINT', () => {
      const cli: typeof CLI = require('.').cli
      const err: NodeJS.ErrnoException = new Error()
      err.code = 'ESIGINT'
      cli.error(err)
    })
    process.on('unhandledRejection', handleError('unhandledRejection'))
    process.on('uncaughtException' as any, handleError('uncaughtException'))
    process.stdout.on('error', handleError('stdout'))
    process.stderr.on('error', handleError('stdout'))
    e.on('error', handleError('cli-ux') as any)
  }
  handleUnhandleds()

  return (severity: 'fatal' | 'error' | 'warn', scope?: string) => (input: Error | string, scopeOrOpts?: string | Options, opts: Options = {}) => {
    if (!input) return
    if (typeof scopeOrOpts === 'string') scope = scopeOrOpts
    else if (typeof scopeOrOpts === 'object') opts = scopeOrOpts
    const error = new CLIError(input, severity, scope, opts)
    const msg: Message = {type: 'error', scope, severity, error}
    e.emit('output', msg)
    if (error['cli-ux'].exit !== false) throw error
  }
}
