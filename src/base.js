// @flow

import type StreamOutput from './stream'

export type BaseOptions = {
  stdout: StreamOutput,
  stderr: StreamOutput,
  debug?: ?boolean
}

class Base {
  stdout: StreamOutput
  stderr: StreamOutput
  debug: ?boolean

  constructor (options: BaseOptions) {
    this.stdout = options.stdout
    this.stderr = options.stderr
    this.debug = !!options.debug
  }
}

module.exports = Base
