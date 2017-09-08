// @flow

const util = require('util')
const stripAnsi = require('strip-ansi')
const path = require('path')

type Options = {
  mock?: boolean,
  displayTimestamps?: boolean
}

class StreamOutput {
  output: string
  stream: stream$Writable
  logfile: ?string
  displayTimestamps: boolean
  mock: boolean

  static startOfLine: boolean

  static logToFile (msg: string, logfile: string) {
    try {
      const fs = require('fs-extra')
      fs.mkdirpSync(path.dirname(logfile))
      fs.appendFileSync(logfile, stripAnsi(msg))
    } catch (err) { console.error(err) }
  }

  constructor (stream: stream$Writable, options: Options = {}) {
    this.stream = stream
    this.displayTimestamps = !!options.displayTimestamps
    this.mock = !!options.mock
    if (this.mock) this.output = ''
  }

  write (msg: string, options: {log?: boolean} = {}) {
    // const log = options.log !== false
    // if (log) this.writeLogFile(msg, this.constructor.startOfLine)
    // conditionally show timestamp if configured to display
    if (this.constructor.startOfLine && this.displayTimestamps) msg = this.timestamp(msg)
    if (this.mock) this.output += stripAnsi(msg)
    else this.stream.write(msg)
    this.constructor.startOfLine = msg.endsWith('\n')
  }

  timestamp (msg: string): string {
    const moment = require('moment')
    return `[${moment().format()}] ${msg}`
  }

  log (data: string, ...args: any[]) {
    let msg = data ? util.format(data, ...args) : ''
    msg += '\n'
    this.write(msg)
    // this.out.action.pause(() => this.write(msg))
  }

  // writeLogFile (msg: string, withTimestamp: boolean) {
  //   if (!this.logfile) return
  //   msg = withTimestamp ? this.timestamp(msg) : msg
  //   logToFile(msg, this.logfile)
  // }
}

StreamOutput.startOfLine = true

module.exports = StreamOutput
