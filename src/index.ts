import * as EventEmitter from 'events'

import {ActionBase} from './action/base'
import deps from './deps'
import Errors, {CLIError, Options as ErrorOptions} from './errors'
import {ExitError} from './exit'
import * as Logger from './logger'
import Output from './output'
import {IPromptOptions} from './prompt'
import * as Table from './styled/table'

import {config, Config} from './config'

const e = new EventEmitter()
const output = Output(e)
const errors = Errors(e)
const logger = Logger.default(e)

export const cli = {
  config,
  trace: output('trace'),
  debug: output('debug'),
  info: output('info'),
  log: output('info'),

  warn: errors('warn'),
  error: errors('error'),
  fatal: errors('fatal'),

  exit(code = 1, error?: Error) { throw new ExitError(code, error) },

  get prompt() { return deps.prompt.prompt },
  get confirm() { return deps.prompt.confirm },
  get action() { return config.action },
  styledObject(obj: any, keys?: string[]) { cli.info(deps.styledObject(obj, keys)) },
  get styledHeader() { return deps.styledHeader },
  get styledJSON() { return deps.styledJSON },
  get table() { return deps.table },

  async done() {
    config.action.stop()
    await logger.flush()
    // await flushStdout()
  }
}
export default cli

export {
  config,
  ActionBase,
  CLIError,
  Config,
  ErrorOptions,
  Errors,
  ExitError,
  IPromptOptions,
  Table,
}

process.once('exit', async () => {
  try {
    await cli.done()
  } catch (err) {
    // tslint:disable no-console
    console.error(err)
    process.exitCode = 1
  }
})

// async function flushStdout() {
//   function timeout(p: Promise<any>, ms: number) {
//     function wait(ms: number, unref: boolean = false) {
//       return new Promise(resolve => {
//         let t: any = setTimeout(resolve, ms)
//         if (unref) t.unref()
//       })
//     }

//     return Promise.race([p, wait(ms, true).then(() => cli.warn('timed out'))])
//   }

//   async function flush() {
//     let p = new Promise(resolve => process.stdout.once('drain', resolve))
//     process.stdout.write('')
//     return p
//   }

//   await timeout(flush(), 10000)
// }
