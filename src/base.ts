// @flow

import { StreamOutput } from './stream'

export interface IBaseOptions {
  stdout: StreamOutput
  stderr: StreamOutput
  debug: boolean
  errlog?: string
}

export abstract class Base {
  public stdout: StreamOutput
  public stderr: StreamOutput
  protected options: IBaseOptions

  constructor(options: Partial<IBaseOptions> = {}) {
    this.options = {
      debug: !!options.debug,
      stderr: new StreamOutput(),
      stdout: new StreamOutput(),
      ...options,
    }
    this.stdout = this.options.stdout
    this.stderr = this.options.stderr
  }
}
