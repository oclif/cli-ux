import * as Errors from '@oclif/errors'
import * as util from 'util'

import {ActionBase} from './action/base'
import {config, Config} from './config'
import deps from './deps'
import {ExitError} from './exit'
import {IPromptOptions} from './prompt'
import * as Table from './styled/table'

export const ux = {
  config,

  warn: Errors.warn,
  error: Errors.error,
  exit: Errors.exit,

  get prompt() {
    return deps.prompt.prompt
  },
  /**
   * "press anykey to continue"
   */
  get anykey() {
    return deps.prompt.anykey
  },
  get confirm() {
    return deps.prompt.confirm
  },
  get action() {
    return config.action
  },
  get prideAction() {
    return config.prideAction
  },
  styledObject(obj: any, keys?: string[]) {
    ux.info(deps.styledObject(obj, keys))
  },
  get styledHeader() {
    return deps.styledHeader
  },
  get styledJSON() {
    return deps.styledJSON
  },
  get table() {
    return deps.table
  },
  get tree() {
    return deps.tree
  },
  get open() {
    return deps.open
  },
  get wait() {
    return deps.wait
  },
  get progress() {
    return deps.progress
  },

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

  log(format?: string, ...args: string[]) {
    this.info(format || '', ...args)
  },

  url(text: string, uri: string, params = {}) {
    const supports = require('supports-hyperlinks')
    if (supports.stdout) {
      const hyperlinker = require('hyperlinker')
      this.log(hyperlinker(text, uri, params))
    } else {
      this.log(uri)
    }
  },

  annotation(text: string, annotation: string) {
    const supports = require('supports-hyperlinks')
    if (supports.stdout) {
      // \u001b]8;;https://google.com\u0007sometext\u001b]8;;\u0007
      this.log(`\u001B]1337;AddAnnotation=${text.length}|${annotation}\u0007${text}`)
    } else {
      this.log(text)
    }
  },

  async flush() {
    function timeout(p: Promise<any>, ms: number) {
      function wait(ms: number, unref = false) {
        return new Promise(resolve => {
          const t: any = setTimeout(() => resolve(null), ms)
          if (unref) t.unref()
        })
      }

      return Promise.race([p, wait(ms, true).then(() => ux.error('timed out'))])
    }

    async function flush() {
      const p = new Promise(resolve => process.stdout.once('drain', () => resolve(null)))
      process.stdout.write('')
      return p
    }

    await timeout(flush(), 10000)
  },
}
export default ux
export const cli = ux

export {
  config,
  ActionBase,
  Config,
  ExitError,
  IPromptOptions,
  Table,
}

const cliuxProcessExitHandler = async () => {
  try {
    await ux.done()
  } catch (error) {
    // tslint:disable no-console
    console.error(error)
    process.exitCode = 1
  }
}
// to avoid MaxListenersExceededWarning
// only attach named listener once
const cliuxListener = process.listeners('exit').find(fn => fn.name === cliuxProcessExitHandler.name)
if (!cliuxListener) {
  process.once('exit', cliuxProcessExitHandler)
}
