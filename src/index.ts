import * as Errors from '@oclif/errors'
import * as util from 'util'

import {ActionBase} from './action/base'
import {config, Config} from './config'
import deps from './deps'
import {ExitError} from './exit'
import {IPromptOptions} from './prompt'
import * as Table from './styled/table'

export const cli = {
  config,

  warn: Errors.warn,
  error: Errors.error,
  exit: Errors.exit,

  get prompt() { return deps.prompt.prompt },
  get confirm() { return deps.prompt.confirm },
  get action() { return config.action },
  styledObject(obj: any, keys?: string[]) { cli.info(deps.styledObject(obj, keys)) },
  get styledHeader() { return deps.styledHeader },
  get styledJSON() { return deps.styledJSON },
  get table() { return deps.table },

  async done() {
    config.action.stop()
    // await flushStdout()
  },

  trace(format: string, ...args: string[]) {
    if (this.config.outputLevel === 'trace') {
      process.stdout.write(util.format(format, ...args) + '\n')
    }
  },

  debug(format: string, ...args: string[]) {
    if (['trace', 'debug'].includes(this.config.outputLevel)) {
      process.stdout.write(util.format(format, ...args) + '\n')
    }
  },

  info(format: string, ...args: string[]) {
    process.stdout.write(util.format(format, ...args) + '\n')
  },

  log(format: string, ...args: string[]) {
    this.info(format, ...args)
  },
}
export default cli

export {
  config,
  ActionBase,
  Config,
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
