// @flow

import StreamOutput from './stream'
import Errors from './errors'

type Options = {
  errlog?: string,
  mock?: boolean,
  debug?: boolean
}

export default class CLIUX {
  options: Options
  _stdout: StreamOutput
  _stderr: StreamOutput
  _errors: Errors

  constructor (options: Options = {}) {
    this.options = options
    let streamOptions = {
      mock: this.options.mock
    }
    this._stdout = new StreamOutput(process.stdout, streamOptions)
    this._stderr = new StreamOutput(process.stderr, streamOptions)
    let depOpts = {stdout: this._stdout, stderr: this._stderr, debug: !!options.debug}
    this._errors = new Errors(depOpts)
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

  warn (err: Error | string, options: {prefix?: string} = {}) {
    return this._errors.warn(err, options)
  }

  // get CLIUX (): Class<CLIUX> {
  //   return CLIUX
  // }
}
