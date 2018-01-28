// tslint:disable no-console

import chalk from 'chalk'
import * as clean from 'clean-stack'
import * as extract from 'extract-stack'
import indent = require('indent-string')
import * as _ from 'lodash'
import {inspect} from 'util'

import CLI from '.'
import {config} from './config'
import deps from './deps'
import {IEventEmitter} from './events'
import styledObject from './styled/object'

export interface Message {
  type: 'error'
  severity: 'fatal' | 'error' | 'warn'
  error: CLIError
}

export interface Options {
  exit?: number | false
  context?: object
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
  const context = err['cli-ux'] && err['cli-ux'].context
  if (context && !_.isEmpty(context)) {
    message += '\n' + indent(styledObject(err['cli-ux'].context), 4)
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
    const severity = (err['cli-ux'] && err['cli-ux'].severity) || 'error'
    const msg = [
      _.upperFirst(severity === 'warn' ? 'warning' : severity),
      ': ',
      getErrorMessage(err),
    ].join('')
    if (process.env.CI || severity === 'fatal' || config.debug) {
      // show stack trace
      let stack = err.stack || inspect(err)
      stack = clean(stack, {pretty: true})
      stack = extract(stack)
      return [msg, stack].join('\n')
    }
    let bang = severity === 'warn' ? chalk.yellow(arrow) : chalk.red(arrow)
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
    exit: number | false
    context: object
  }

  constructor(input: any, severity: 'fatal' | 'error' | 'warn', opts: Options) {
    function getExitCode(options: Options): false | number {
      let exit = options.exit === undefined ? (options as any).exitCode : options.exit
      if (exit === false) return false
      if (exit === undefined) return 1
      return exit
    }

    const err: CLIError = typeof input === 'string' ? super(input) && this : input
    err['cli-ux'] = err['cli-ux'] || {
      severity,
      exit: severity === 'warn' ? false : getExitCode(opts),
      context: {...config.context, ...opts.context},
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
    const handleError = (_: string) => async (err: CLIError) => {
      // ignore EPIPE errors
      // these come from using | head and | tail
      // and can be ignored
      try {
        const cli: typeof CLI = require('.').cli
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

  return (severity: 'fatal' | 'error' | 'warn') => (input: Error | string, opts: Options = {}) => {
    if (!input) return
    const error = new CLIError(input, severity, opts)
    const msg: Message = {type: 'error', severity, error}
    e.emit('output', msg)
    if (error['cli-ux'].exit !== false) throw error
  }
}
