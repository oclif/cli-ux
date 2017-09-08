// @flow

import type StreamOutput from './stream'

export type BaseOptions = {
  stdout: StreamOutput,
  stderr: StreamOutput,
  debug?: ?boolean,
  errlog?: ?string
}

class Base {
  stdout: StreamOutput
  stderr: StreamOutput
  debug: ?boolean
  errlog: ?string

  constructor (options: BaseOptions) {
    this.stdout = options.stdout
    this.stderr = options.stderr
    this.debug = !!options.debug
    this.errlog = options.errlog
  }
}

module.exports = Base
