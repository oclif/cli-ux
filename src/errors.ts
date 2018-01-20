// tslint:disable no-console

import {inspect} from 'util'

import CLI from '.'
import {config} from './config'
import deps from './deps'
import {IEventEmitter} from './events'

export interface Message {
  type: 'error'
  scope: string | undefined
  severity: 'fatal' | 'error' | 'warn'
  error: Error
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
    message = `${inspect(err.code)}: ${message}`
  } else if (err.message) {
    message = err.message
  }
  return message || inspect(err)
}

function wrap(msg: string): string {
  const linewrap = require('@heroku/linewrap')
  return linewrap(6, deps.screen.errtermwidth, {
    skip: /^\$ .*$/,
    skipScheme: 'ansi-color',
  })(msg)
}

function render(message: Message): string {
  let bang = deps.chalk.red(arrow)
  let msg = message.scope ? `${message.scope}: ${getErrorMessage(message.error)}` : getErrorMessage(message.error)
  if (message.severity === 'fatal') {
    bang = deps.chalk.bgRed.bold.white(' FATAL ')
    msg += `\n${inspect(message.error)}`
  }
  if (message.severity === 'warn') bang = deps.chalk.yellow(arrow)
  return bangify(wrap(msg), bang)
}

export class CLIError extends Error {
  code: string
  'cli-ux': {
    severity: 'fatal' | 'error' | 'warn'
    scope: string | undefined
    exit: number | false
  }

  constructor(input: any, severity: 'fatal' | 'error' | 'warn', scope: string | undefined, opts: Options) {
    const err: CLIError = typeof input === 'string' ? super(input) && this : input
    err['cli-ux'] = err['cli-ux'] || {
      severity,
      scope,
      exit: severity === 'warn' ? false : getExitCode(opts),
    }
    return err
  }
}

function getExitCode(options: Options): false | number {
  let exit = options.exit === undefined ? (options as any).exitCode : options.exit
  if (exit === false) return false
  if (exit === undefined) return 1
  return exit
}

export default (e: IEventEmitter) => {
  e.on('output', m => {
    if (m.type !== 'error') return
    const bang = (m.severity === 'warn' && deps.chalk.yellowBright('!'))
    || (m.severity === 'fatal' && deps.chalk.bold.bgRedBright('!!!'))
    || deps.chalk.bold.redBright('!')
    try {
      config.action.pause(() => {
        console.error(render(m))
      }, bang)
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
          await cli.done().catch(cli.debug)
          process.exit(err['cli-ux'].exit as number)
        } else {
          cli.fatal(err, {exit: false})
          await cli.done().catch(cli.debug)
          process.exit(100)
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
    process.once('unhandledRejection', handleError('unhandledRejection'))
    process.once('uncaughtException', handleError('uncaughtException'))
    process.stdout.on('error', handleError('stdout'))
    process.stderr.on('error', handleError('stdout'))
    e.on('error', handleError('cli-ux'))
  }
  handleUnhandleds()

  return (severity: 'fatal' | 'error' | 'warn', scope?: string) => (input: Error | string, opts: Options = {}) => {
    const error = new CLIError(input, severity, scope, opts)
    const msg: Message = {type: 'error', scope, severity, error}
    e.emit('output', msg)
    if (error['cli-ux'].exit !== false) throw error
  }
}
