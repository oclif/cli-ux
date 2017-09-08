// @flow

import StreamOutput from './stream'

interface BaseOptions {
  stdout: StreamOutput
  stderr: StreamOutput
  debug?: boolean
  errlog?: string
}

export default abstract class Base {
  options: BaseOptions
  stdout: StreamOutput
  stderr: StreamOutput

  constructor (options: BaseOptions) {
    this.options = options
    this.stdout = options.stdout
    this.stderr = options.stderr
  }
}
