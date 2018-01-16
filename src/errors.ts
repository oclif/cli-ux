// tslint:disable no-console

import * as screen from '@dxcli/screen'
import chalk from 'chalk'
import Rx = require('rxjs/Rx')
import {inspect} from 'util'

import {CLI} from '.'
import {ErrorMessage, Message} from './message'

const arrow = process.platform === 'win32' ? ' ×' : ' ✖'

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

function wrap(msg: string): string {
  const linewrap = require('@heroku/linewrap')
  return linewrap(6, screen.errtermwidth, {
    skip: /^\$ .*$/,
    skipScheme: 'ansi-color',
  })(msg)
}

export default function (cli: CLI): Rx.Observable<any> {
  function renderError(message: ErrorMessage): string {
    let bang = chalk.red(arrow)
    if (message.severity === 'fatal') bang = chalk.bgRed.bold.white(' FATAL ')
    if (message.severity === 'warn') bang = chalk.yellow(arrow)
    const msg = cli.scope ? `${cli.scope}: ${getErrorMessage(message.error)}` : getErrorMessage(message.error)
    return bangify(wrap(msg), bang)
  }

  const handleError = (scope: string) => async (err: NodeJS.ErrnoException) => {
    // ignore EPIPE errors
    // these come from using | head and | tail
    // and can be ignored
    try {
      if (err.code === 'EPIPE') return
      if (err.code === 'EEXIT') {
        process.exitCode = (err as any).status
      } else {
        const cli = new CLI(scope)
        cli.fatal(err, {exit: false})
        await cli.done()
        process.exit(100)
      }
    } catch (err) {
      console.error(err)
      process.exit(101)
    }
  }

  function handleUnhandleds() {
    process.once('SIGINT', () => {
      const cli = new CLI('SIGINT')
      const err: NodeJS.ErrnoException = new Error()
      err.code = 'ESIGINT'
      cli.error(err)
    })
    process.once('unhandledRejection', handleError('unhandledRejection'))
    process.once('uncaughtException', handleError('uncaughtException'))
    process.stdout.on('error', handleError)
    process.stderr.on('error', handleError)
  }

  handleUnhandleds()

  return cli
    .takeUntil(cli.filter(m => m.type === 'done'))
    .filter<Message, ErrorMessage>((m): m is ErrorMessage => m.type === 'error')
    .do(m => {
      cli.next({type: 'logger', severity: m.severity, message: getErrorMessage(m.error)})
      process.stderr.write(renderError(m) + '\n')
    })
}
