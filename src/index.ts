// @flow

import { Errors } from './errors'
import { StreamOutput } from './stream'

export interface IOptions {
  errlog?: string
  mock?: boolean
  debug?: boolean
}

export class CLIUX {
  private stdoutStream: StreamOutput
  private stderrStream: StreamOutput
  private errors: Errors

  constructor(readonly options: IOptions = {}) {
    // this.stdoutStream = new StreamOutput(this.options.mock ? undefined : process.stdout)
    this.stderrStream = new StreamOutput(this.options.mock ? undefined : process.stderr)
    const depOpts = {
      debug: !!options.debug,
      stderr: this.stdoutStream,
      stdout: this.stdoutStream,
    }
    this.errors = new Errors(depOpts)
  }

  get stderr(): string {
    const output = this.stderrStream.output
    if (!output) {
      throw new Error('not mocking stderr')
    }
    return output
  }

  get stdout(): string {
    const output = this.stdoutStream.output
    if (!output) {
      throw new Error('not mocking stdout')
    }
    return output
  }

  // public warn(err: Error | string, options: { prefix?: string } = {}) {
  //   return this.errors.warn(err, options)
  // }

  get warn() {
    return this.errors.warn.bind(this.errors)
  }
}

export const cli = new CLIUX()
